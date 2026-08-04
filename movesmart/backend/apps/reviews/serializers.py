"""apps/reviews/serializers.py — Validation for tenant reviews"""
from rest_framework import serializers


class ReviewCreateSerializer(serializers.Serializer):
    property_id   = serializers.CharField(max_length=100)
    tenant_name   = serializers.CharField(max_length=200)
    rating        = serializers.IntegerField(min_value=1, max_value=5)
    review        = serializers.CharField(max_length=2000)
    move_in_date  = serializers.DateField(required=False, allow_null=True)
    move_out_date = serializers.DateField(required=False, allow_null=True)


class ReviewReplySerializer(serializers.Serializer):
    reply = serializers.CharField(max_length=1000)
