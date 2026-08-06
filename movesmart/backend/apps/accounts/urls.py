"""apps/accounts/urls.py — URL patterns for accounts app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('register', views.RegisterView.as_view(), name='auth-register'),
    path('login',    views.LoginView.as_view(),    name='auth-login'),
    path('refresh',  views.RefreshView.as_view(),  name='auth-refresh'),
    path('logout',   views.LogoutView.as_view(),   name='auth-logout'),
    path('role',     views.SetRoleView.as_view(),   name='auth-set-role'),
    path('profile',  views.ProfileView.as_view(),   name='profile'),
    path('razorpay/create-order', views.RazorpayCreateOrderView.as_view(), name='razorpay-create-order'),
    path('razorpay/verify-payment', views.RazorpayVerifyPaymentView.as_view(), name='razorpay-verify-payment'),
    path('google', views.GoogleAuthView.as_view(), name='auth-google'),
    path('change-password', views.ChangePasswordView.as_view(), name='auth-change-password'),
    path('delete-account', views.DeleteAccountView.as_view(), name='auth-delete-account'),
]
