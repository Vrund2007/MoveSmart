"""apps/accounts/views.py — DRF views for auth, registration, role assignment (PRD §6, Architecture.md §4.0, FR-1, FR-2)"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.responses import api_response
from .serializers import (
    RegisterSerializer, LoginSerializer, RoleSerializer, PROFILE_SERIALIZER_MAP
)
from . import services, repository
from apps.commute.maps_client import clear_commute_cache


class RegisterView(APIView):
    """POST /api/auth/register — create account (email + password only at this step)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        try:
            user_doc, tokens = services.register_user(
                email=data['email'],
                password=data['password'],
                name=data.get('name', '')
            )
        except services.DuplicateEmailError as exc:
            return api_response(
                errors={'email': str(exc)},
                message=str(exc),
                status_code=status.HTTP_409_CONFLICT
            )

        return api_response(
            data={'user': user_doc, **tokens},
            message="Account registered successfully.",
            status_code=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """POST /api/auth/login — authenticate and return JWT."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        try:
            safe_user, tokens = services.authenticate_user(
                email=data['email'],
                password=data['password']
            )
        except services.InvalidCredentialsError as exc:
            return api_response(
                errors={'detail': str(exc)},
                message=str(exc),
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        return api_response(
            data={'user': safe_user, **tokens},
            message="Authenticated successfully.",
            status_code=status.HTTP_200_OK
        )


class RefreshView(APIView):
    """POST /api/auth/refresh — exchange refresh token for a new access token."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return api_response(
                message="Refresh token is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        try:
            refresh = RefreshToken(refresh_token)
            return api_response(
                data={'access': str(refresh.access_token)},
                message="Access token refreshed successfully.",
                status_code=status.HTTP_200_OK
            )
        except Exception as exc:
            return api_response(
                errors={'detail': str(exc)},
                message="Invalid or expired refresh token.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """POST /api/auth/logout — clean client token logout."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return api_response(
            message="Logout successful. Tokens cleared from client.",
            status_code=status.HTTP_200_OK
        )


class SetRoleView(APIView):
    """PATCH /api/auth/role — set role once after signup (FR-1); 'admin' excluded (FR-2)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = RoleSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        role = serializer.validated_data['role']
        user_id = request.user.id

        try:
            updated_user = services.assign_role(user_id=user_id, role=role)
        except services.RoleImmutableError as exc:
            return api_response(
                errors={'detail': str(exc)},
                message=str(exc),
                status_code=status.HTTP_409_CONFLICT
            )

        return api_response(
            data={'user': updated_user},
            message="Role assigned successfully.",
            status_code=status.HTTP_200_OK
        )


class ProfileView(APIView):
    """GET /api/profile — read role-specific profile.
       PUT /api/profile — update role-specific profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = repository.get_user_by_id(request.user.id)
        if not user:
            return api_response(
                message="User not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return api_response(
            data={'user': user},
            message="User profile retrieved successfully."
        )

    def put(self, request):
        user_role = getattr(request.user, 'role', None) or 'find_accommodation'
        SerializerClass = PROFILE_SERIALIZER_MAP.get(user_role, PROFILE_SERIALIZER_MAP.get('find_accommodation'))
        if not SerializerClass:
            return api_response(
                message=f"No profile fields defined for role '{user_role}'.",
                status_code=status.HTTP_400_BAD_REQUEST
            )


        serializer = SerializerClass(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Clear commute cache if work_area was updated (recommendations will re-fetch fresh data)
        if 'work_area' in serializer.validated_data:
            clear_commute_cache()

        updated_user = services.update_profile(
            user_id=request.user.id,
            profile_data=serializer.validated_data
        )

        return api_response(
            data={'user': updated_user},
            message="Role profile updated successfully."
        )


import hmac
import hashlib
import time
import razorpay
from django.conf import settings

class RazorpayCreateOrderView(APIView):
    """POST /api/auth/razorpay/create-order — Create Razorpay order (₹30) for unlocking premium seeker features."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        feature = request.data.get('feature')
        if feature not in ['recommendations', 'commute']:
            return api_response(message="Invalid feature specified.", status_code=status.HTTP_400_BAD_REQUEST)

        key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_TLywXESF3GfgEJ')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'Z416RuavJ486cEYHNVjkqJUi')

        try:
            client = razorpay.Client(auth=(key_id, key_secret))
            user_short = str(request.user.id)[-8:]
            order_data = {
                'amount': 3000,  # ₹30 in paise
                'currency': 'INR',
                'receipt': f"rcpt_{user_short}_{int(time.time())}",
                'notes': {
                    'user_id': str(request.user.id),
                    'feature': feature
                }
            }
            order = client.order.create(data=order_data)
            return api_response(
                data={
                    'order_id': order['id'],
                    'amount': order['amount'],
                    'currency': order['currency'],
                    'key_id': key_id,
                    'feature': feature
                },
                message="Razorpay order created."
            )
        except Exception as exc:
            return api_response(message=f"Razorpay order creation failed: {str(exc)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RazorpayVerifyPaymentView(APIView):
    """POST /api/auth/razorpay/verify-payment — Verify HMAC signature and unlock feature in user document."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')
        feature = request.data.get('feature')

        if not all([order_id, payment_id, signature, feature]):
            return api_response(message="Missing required Razorpay payment parameters.", status_code=status.HTTP_400_BAD_REQUEST)

        if feature not in ['recommendations', 'commute']:
            return api_response(message="Invalid feature specified.", status_code=status.HTTP_400_BAD_REQUEST)

        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'Z416RuavJ486cEYHNVjkqJUi')

        msg = f"{order_id}|{payment_id}".encode('utf-8')
        generated_sig = hmac.new(key_secret.encode('utf-8'), msg, hashlib.sha256).hexdigest()

        if generated_sig != signature:
            return api_response(message="Razorpay signature verification failed.", status_code=status.HTTP_400_BAD_REQUEST)

        from db.users_repo import unlock_feature
        updated_user = unlock_feature(str(request.user.id), feature)

        return api_response(
            data={
                'user': updated_user,
                'unlocked_features': updated_user.get('unlocked_features', []),
                'unlocked_feature': feature
            },
            message=f"Payment verified successfully! Feature '{feature}' unlocked."
        )


class GoogleAuthView(APIView):
    """POST /api/auth/google — Google OAuth authentication & registration."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return api_response(message="Email address is required for Google login.", status_code=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name', '')
        picture = request.data.get('picture', '')
        google_id = request.data.get('google_id', '')
        role = request.data.get('role', 'seeker')

        user_doc, tokens = services.google_auth_user(
            email=email,
            name=name,
            picture=picture,
            google_id=google_id,
            role=role
        )

        return api_response(
            data={'user': user_doc, **tokens},
            message="Google authentication successful."
        )


class ChangePasswordView(APIView):
    """POST /api/auth/change-password — change user password after verifying current password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return api_response(
                message="Both old_password and new_password are required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            services.change_password(
                user_id=str(request.user.id),
                old_password=old_password,
                new_password=new_password
            )
            return api_response(
                message="Password updated successfully.",
                status_code=status.HTTP_200_OK
            )
        except (services.InvalidCredentialsError, services.AccountServiceError) as exc:
            return api_response(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST
            )


class DeleteAccountView(APIView):
    """POST /api/auth/delete-account — verify password and permanently delete user account."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        if not password:
            return api_response(
                message="Password confirmation is required to delete account.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            services.delete_account(
                user_id=str(request.user.id),
                password=password
            )
            return api_response(
                message="Account deleted successfully.",
                status_code=status.HTTP_200_OK
            )
        except (services.InvalidCredentialsError, services.AccountServiceError) as exc:
            return api_response(
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST
            )

