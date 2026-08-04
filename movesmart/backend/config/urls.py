"""config/urls.py — Root URL routing; includes each app's urls (Architecture.md §5, §8)"""
from django.urls import path, include
from apps.common.views import HealthCheckView

urlpatterns = [
    path('api/health', HealthCheckView.as_view(), name='health-check'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.listings.urls')),
    path('api/', include('apps.recommendations.urls')),
    path('api/', include('apps.commute.urls')),
    path('api/', include('apps.cost_of_living.urls')),
    path('api/', include('apps.assistant.urls')),
    path('api/', include('apps.enquiries.urls')),
    path('api/', include('apps.broker.urls')),
    path('api/', include('apps.company.urls')),
    path('api/', include('apps.visits.urls')),
    path('api/', include('apps.messages.urls')),
    path('api/admin/', include('apps.admin_review.urls')),
    # Phase 10 — Owner module
    path('api/owner/payments/', include('apps.payments.urls')),
    path('api/owner/reviews/', include('apps.reviews.urls')),
    path('api/owner/documents/', include('apps.documents.urls')),
    path('api/owner/visits/', include('apps.visits.owner_urls')),
]

