"""apps/payments/urls.py"""
from django.urls import path
from .views import PaymentsView, PaymentDetailView

urlpatterns = [
    path('', PaymentsView.as_view(), name='owner-payments-list'),
    path('<str:payment_id>/', PaymentDetailView.as_view(), name='owner-payment-detail'),
]
