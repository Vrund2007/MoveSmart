"""apps/payments/serializers.py — Validation for payment records"""
from rest_framework import serializers

PAYMENT_STATUSES = ['received', 'pending', 'overdue', 'refunded']
PAYMENT_METHODS  = ['bank_transfer', 'cash', 'upi', 'cheque', 'other']


class PaymentCreateSerializer(serializers.Serializer):
    property_id  = serializers.CharField(max_length=100)
    tenant_name  = serializers.CharField(max_length=200)
    amount       = serializers.FloatField(min_value=0.01)
    payment_date = serializers.DateField()
    payment_status = serializers.ChoiceField(choices=PAYMENT_STATUSES, default='received')
    payment_method = serializers.ChoiceField(choices=PAYMENT_METHODS, default='bank_transfer')
    notes        = serializers.CharField(max_length=500, allow_blank=True, default='')


class PaymentUpdateSerializer(serializers.Serializer):
    tenant_name    = serializers.CharField(max_length=200, required=False)
    amount         = serializers.FloatField(min_value=0.01, required=False)
    payment_date   = serializers.DateField(required=False)
    payment_status = serializers.ChoiceField(choices=PAYMENT_STATUSES, required=False)
    payment_method = serializers.ChoiceField(choices=PAYMENT_METHODS, required=False)
    notes          = serializers.CharField(max_length=500, allow_blank=True, required=False)
