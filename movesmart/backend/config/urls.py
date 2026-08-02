"""config/urls.py — Root URL routing; includes each app's urls (Architecture.md §5, §8)"""
from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.listings.urls')),
    path('api/', include('apps.recommendations.urls')),
    path('api/', include('apps.commute.urls')),
    path('api/', include('apps.cost_of_living.urls')),
    path('api/', include('apps.assistant.urls')),
    path('api/', include('apps.enquiries.urls')),
    path('api/', include('apps.broker.urls')),
    path('api/', include('apps.company.urls')),
    path('api/admin/', include('apps.admin_review.urls')),
    # TODO: add saved-listings URL when implemented in apps.listings
]
