"""apps/accounts/urls.py — URL patterns for accounts app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('register', views.RegisterView.as_view(), name='auth-register'),
    path('login',    views.LoginView.as_view(),    name='auth-login'),
    path('refresh',  views.RefreshView.as_view(),  name='auth-refresh'),
    path('role',     views.SetRoleView.as_view(),   name='auth-set-role'),
    path('profile',  views.ProfileView.as_view(),   name='profile'),
]

