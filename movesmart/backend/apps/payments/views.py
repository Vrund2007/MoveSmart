"""apps/payments/views.py — DRF views for owner income / payment tracking"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsOwner
from db import payments_repo
from .serializers import PaymentCreateSerializer, PaymentUpdateSerializer


class PaymentsView(APIView):
    """GET /api/owner/payments — list all payments for the authenticated owner.
    POST /api/owner/payments — create a new manual payment record.
    """
    permission_classes = [IsOwner]

    def get(self, request):
        payments = payments_repo.get_owner_payments(request.user.id)
        summary = payments_repo.get_monthly_income_summary(request.user.id)
        return api_response(data={"payments": payments, "summary": summary},
                            message="Payments retrieved.")

    def post(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error.",
                                status_code=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        data["owner_id"] = request.user.id
        # Ensure payment_date is a string (DateField returns date object)
        data["payment_date"] = str(data["payment_date"])
        pid = payments_repo.create_payment(data)
        created = payments_repo.get_payment_by_id(pid, request.user.id)
        return api_response(data=created, message="Payment record created.",
                            status_code=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    """PUT /api/owner/payments/:id — update a payment.
    DELETE /api/owner/payments/:id — delete a payment.
    """
    permission_classes = [IsOwner]

    def put(self, request, payment_id):
        serializer = PaymentUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error.",
                                status_code=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        if "payment_date" in data:
            data["payment_date"] = str(data["payment_date"])
        updated = payments_repo.update_payment(payment_id, request.user.id, data)
        if not updated:
            return api_response(message="Payment not found.", status_code=status.HTTP_404_NOT_FOUND)
        record = payments_repo.get_payment_by_id(payment_id, request.user.id)
        return api_response(data=record, message="Payment updated.")

    def delete(self, request, payment_id):
        deleted = payments_repo.delete_payment(payment_id, request.user.id)
        if not deleted:
            return api_response(message="Payment not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Payment deleted.")
