"""apps/documents/urls.py"""
from django.urls import path
from .views import DocumentsView, DocumentDetailView

urlpatterns = [
    path('', DocumentsView.as_view(), name='owner-documents-list'),
    path('<str:doc_id>/', DocumentDetailView.as_view(), name='owner-document-detail'),
]
