"""apps/listings/views.py — DRF views for listings browse, create, manage, ML predictions (Architecture.md §4.1–§4.3, FR-3, FR-7)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from apps.common.responses import api_response
from apps.common.constants import UserRoles
from apps.accounts.permissions import IsOwnerOrBroker
from db import listings_repo, saved_items_repo
from ml.rent_prediction import model as rent_model
from ml.suspicious_listing import model as anomaly_model
from .serializers import ListingCreateSerializer, ListingUpdateSerializer


class ListingsView(APIView):
    """GET /api/listings — browse approved listings (status=approved always, FR-3).
    POST /api/listings — Owner/Broker create listing (status: pending_review set server-side, FR-3).
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrBroker()]

    def get(self, request):
        try:
            page = int(request.query_params.get('page', 1))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 24))
        except (ValueError, TypeError):
            page_size = 24

        filters = {
            'locality': request.query_params.get('locality'),
            'bhk': request.query_params.get('bhk'),
            'deal_type': request.query_params.get('deal_type'),
            'min_price': request.query_params.get('min_price'),
            'max_price': request.query_params.get('max_price'),
            'search': request.query_params.get('search'),
        }
        filters = {k: v for k, v in filters.items() if v is not None}

        listings, total_count = listings_repo.get_approved_listings_paginated(
            filters, page=page, page_size=page_size
        )

        # Enrich rental listings with ML rent inference outputs efficiently if missing
        enriched = []
        for item in listings:
            item_data = dict(item)

            if not item_data.get('predicted_price_range'):
                try:
                    pred = rent_model.predict_fair_price(item_data)
                    if pred:
                        item_data['predicted_price_range'] = pred
                except Exception:
                    pass

            if not item_data.get('trust_score') and not item_data.get('verification_flags'):
                try:
                    anomaly_pred = anomaly_model.predict_suspicious(item_data)
                    if anomaly_pred:
                        item_data['verification_flags'] = anomaly_pred
                        item_data['trust_score'] = anomaly_pred
                except Exception:
                    item_data.setdefault('trust_score', item_data.get('verification_flags'))

            enriched.append(item_data)


        total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 1

        return api_response(
            data=enriched,
            message="Listings retrieved successfully.",
            meta={
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            }
        )



    def post(self, request):
        serializer = ListingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Listing creation validation error: {serializer.errors}")
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        data['status'] = 'pending_review'
        data['source'] = 'landlord_portal'
        data['source_detail'] = 'landlord_form'
        if not data.get('title'):
            data['title'] = 'Property Listing'
        if not data.get('locality'):
            data['locality'] = 'Ahmedabad'

        if getattr(request.user, 'role', None) == UserRoles.PROPERTY_OWNER:
            data['owner_id'] = request.user.id
            data['submitted_by_broker_id'] = None
        else:
            data['owner_id'] = request.user.id
            data['submitted_by_broker_id'] = getattr(request.user, 'id', None)

        listing_id = listings_repo.create_listing(data)
        created_item = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)

        return api_response(data=created_item, message="Listing submitted for approval.", status_code=status.HTTP_201_CREATED)



class MyListingsView(APIView):
    """GET /api/listings/my — list all listings owned by the logged-in user."""
    permission_classes = [IsAuthenticated, IsOwnerOrBroker]

    def get(self, request):
        listings = listings_repo.get_owner_listings(request.user.id)
        return api_response(data=listings, message="Owner listings retrieved successfully.")


class ListingDetailView(APIView):
    """GET/PUT/DELETE /api/listings/:id — single listing detail, edit, delete."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrBroker()]

    def get(self, request, listing_id):
        user_id = getattr(request.user, 'id', None) if request.user and request.user.is_authenticated else None
        
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not listing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if listing.get('status') != 'approved':
            if not user_id or (listing.get('owner_id') != user_id and getattr(request.user, 'role', None) != UserRoles.ADMIN):
                return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        # Increment view count in DB on every request (even for same user)
        listings_repo.increment_view_count(listing_id)

        # Optional ML enrichment (AI Valuation Signal)
        item_data = dict(listing)
        item_data['view_count'] = item_data.get('view_count', 0) + 1
        try:
            pred = rent_model.predict_fair_price(item_data)
            if pred:
                item_data['predicted_price_range'] = pred
                item_data['rent_prediction'] = pred
        except Exception:
            item_data['rent_prediction'] = item_data.get('predicted_price_range')



        try:
            item_data['trust_score'] = anomaly_model.predict_suspicious(item_data)
            if item_data['trust_score']:
                item_data['verification_flags'] = item_data['trust_score']
        except Exception:
            item_data['trust_score'] = item_data.get('verification_flags')

        return api_response(data=item_data, message="Listing retrieved successfully.")


    def put(self, request, listing_id):
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not listing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if listing.get('owner_id') != request.user.id and listing.get('submitted_by_broker_id') != request.user.id:
            return api_response(message="Permission denied. You can only edit your own listings.", status_code=status.HTTP_403_FORBIDDEN)

        serializer = ListingUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        update_data = serializer.validated_data

        if listing.get('status') == 'rejected':
            listings_repo.resubmit_listing(listing_id, update_data)
        else:
            listings_repo.update_listing(listing_id, update_data)

        updated = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        return api_response(data=updated, message="Listing updated and submitted for review.")

    def delete(self, request, listing_id):
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not listing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if listing.get('owner_id') != request.user.id and listing.get('submitted_by_broker_id') != request.user.id:
            return api_response(message="Permission denied. You can only delete your own listings.", status_code=status.HTTP_403_FORBIDDEN)

        listings_repo.delete_listing(listing_id)
        return api_response(message="Listing deleted successfully.")


class RentPredictionView(APIView):
    """GET /api/listings/:id/rent-prediction — XGBoost fair rent prediction."""
    permission_classes = [AllowAny]

    def get(self, request, listing_id):
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not listing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        prediction = rent_model.predict_fair_price(listing)
        if not prediction:
            return api_response(data={"message": "Prediction unavailable"}, message="Rent prediction unavailable.")

        return api_response(data=prediction, message="Rent prediction generated successfully.")


class TrustScoreView(APIView):
    """GET /api/listings/:id/trust-score — Isolation Forest anomaly detection signal."""
    permission_classes = [AllowAny]

    def get(self, request, listing_id):
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not listing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        trust_signal = anomaly_model.predict_suspicious(listing)
        if not trust_signal:
            return api_response(data={"is_suspicious": False, "confidence": 50.0, "reason": "Trust score unavailable"}, message="Trust score generated.")

        return api_response(data=trust_signal, message="Trust score generated successfully.")


class ListingAnalyticsView(APIView):
    """GET /api/listings/:id/analytics — view/enquiry counts for Owner/Broker."""
    permission_classes = [IsAuthenticated, IsOwnerOrBroker]

    def get(self, request, listing_id):
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not listing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if listing.get('owner_id') != request.user.id and listing.get('submitted_by_broker_id') != request.user.id:
            return api_response(message="Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

        analytics = {
            "listing_id": listing_id,
            "view_count": listing.get('view_count', 0),
            "enquiry_count": listing.get('enquiry_count', 0)
        }
        return api_response(data=analytics, message="Listing analytics retrieved.")


class SavedListingsView(APIView):
    """POST /api/saved-listings, GET /api/saved-listings — bookmark management."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        listing_id = request.data.get('listing_id')
        if not listing_id:
            return api_response(message="listing_id is required.", status_code=status.HTTP_400_BAD_REQUEST)

        saved = saved_items_repo.save_item(request.user.id, listing_id)
        return api_response(data=saved, message="Listing saved successfully.", status_code=status.HTTP_201_CREATED)

    def get(self, request):
        items = saved_items_repo.get_user_saved_items(request.user.id)
        return api_response(data=items, message="Saved items retrieved.")


class SavedListingDetailView(APIView):
    """DELETE /api/saved-listings/:id — remove bookmark."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, saved_id):
        success = saved_items_repo.remove_saved_item(saved_id, request.user.id)
        if not success:
            return api_response(message="Saved item not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Saved item removed.")


import os
import uuid
import logging
from django.conf import settings
from django.core.files.storage import default_storage

logger = logging.getLogger('movesmart')

class ImageUploadView(APIView):
    """POST /api/listings/upload-image — Upload image or audio file to Cloudinary (or local media fallback)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            files = request.FILES.getlist('images') or request.FILES.getlist('file') or ([request.FILES['image']] if 'image' in request.FILES else [])
            if not files:
                return api_response(message="No media files provided.", status_code=status.HTTP_400_BAD_REQUEST)

            cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', None) or os.getenv('CLOUDINARY_CLOUD_NAME')
            api_key = getattr(settings, 'CLOUDINARY_API_KEY', None) or os.getenv('CLOUDINARY_API_KEY')
            api_secret = getattr(settings, 'CLOUDINARY_API_SECRET', None) or os.getenv('CLOUDINARY_API_SECRET')

            uploaded_urls = []
            uploaded_items = []

            for f in files:
                # 1. Try Cloudinary Signed Upload
                if cloud_name and api_key and api_secret:
                    try:
                        import cloudinary
                        import cloudinary.uploader
                        cloudinary.config(
                            cloud_name=cloud_name,
                            api_key=api_key,
                            api_secret=api_secret,
                            secure=True
                        )
                        f.seek(0)
                        res = cloudinary.uploader.upload(f, resource_type="auto")
                        c_url = res.get('secure_url') or res.get('url')
                        pub_id = res.get('public_id')
                        if c_url:
                            uploaded_urls.append(c_url)
                            uploaded_items.append({
                                "url": c_url,
                                "public_id": pub_id
                            })
                            continue
                    except Exception as exc:
                        logger.warning(f"Cloudinary signed upload failed: {exc}")

                # 2. Reset file pointer before fallback storage
                try:
                    f.seek(0)
                except Exception:
                    pass

                ext = f.name.split('.')[-1] if (f.name and '.' in f.name) else 'jpg'
                raw_filename = f"{uuid.uuid4().hex}.{ext}"
                filename = f"listings/{raw_filename}"
                saved_path = default_storage.save(filename, f)
                url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
                pub_id = f"listings/{raw_filename}"
                uploaded_urls.append(url)
                uploaded_items.append({
                    "url": url,
                    "public_id": pub_id
                })

            return api_response(
                data={
                    "images": uploaded_items,
                    "urls": uploaded_urls,
                    "public_ids": [item["public_id"] for item in uploaded_items],
                    "url": uploaded_urls[0] if uploaded_urls else "",
                    "public_id": uploaded_items[0]["public_id"] if uploaded_items else ""
                },
                message="Images uploaded successfully."
            )
        except Exception as exc:
            logger.error(f"Image upload failed: {exc}")
            return api_response(message=f"Image upload error: {str(exc)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)



