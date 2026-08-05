"""apps/cms/urls.py — URL routes for CMS Content Manager"""
from django.urls import path
from . import views

urlpatterns = [
    path('admin/cms/<str:slug>', views.CMSPageView.as_view(), name='admin-cms'),
]
