"""apps/documents/serializers.py — Validation for property documents"""
from rest_framework import serializers
from db.documents_repo import ALLOWED_DOC_TYPES


class DocumentCreateSerializer(serializers.Serializer):
    property_id    = serializers.CharField(max_length=100)
    title          = serializers.CharField(max_length=200)
    doc_type       = serializers.ChoiceField(choices=ALLOWED_DOC_TYPES)
    file_url       = serializers.CharField(max_length=2048, allow_blank=True, default='')
    file_size      = serializers.IntegerField(required=False, allow_null=True)
    mime_type      = serializers.CharField(max_length=100, default='application/pdf')
    notes          = serializers.CharField(max_length=500, allow_blank=True, default='')
