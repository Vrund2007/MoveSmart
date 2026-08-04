"""apps/reviews/urls.py"""
from django.urls import path
from .views import OwnerReviewsView, ReviewPropertyView, ReviewReplyView

urlpatterns = [
    path('', OwnerReviewsView.as_view(), name='owner-reviews-list'),
    path('property/<str:property_id>/', ReviewPropertyView.as_view(), name='owner-reviews-by-property'),
    path('<str:review_id>/reply/', ReviewReplyView.as_view(), name='owner-review-reply'),
]
