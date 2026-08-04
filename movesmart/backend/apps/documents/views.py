"""apps/documents/views.py — DRF views for property document management"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsOwner
from db import documents_repo
from .serializers import DocumentCreateSerializer


class DocumentsView(APIView):
    """GET /api/owner/documents — list all documents for the owner.
    POST /api/owner/documents — upload (register) a new document metadata record.
    """
    permission_classes = [IsOwner]

    def get(self, request):
        property_id = request.query_params.get("property_id")
        docs = documents_repo.get_owner_documents(request.user.id, property_id=property_id)
        return api_response(data=docs, message="Documents retrieved.")

    def post(self, request):
        serializer = DocumentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error.",
                                status_code=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        data["owner_id"] = request.user.id
        did = documents_repo.create_document(data)
        created = documents_repo.get_document_by_id(did, request.user.id)
        return api_response(data=created, message="Document added.",
                            status_code=status.HTTP_201_CREATED)


class DocumentDetailView(APIView):
    """DELETE /api/owner/documents/:doc_id — remove a document record."""
    permission_classes = [IsOwner]

    def delete(self, request, doc_id):
        deleted = documents_repo.delete_document(doc_id, request.user.id)
        if not deleted:
            return api_response(message="Document not found.",
                                status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Document deleted.")
