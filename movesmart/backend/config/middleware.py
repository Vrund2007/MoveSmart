"""config/middleware.py — Django Middleware for Platform Maintenance Mode (Phase 14)"""
from django.http import JsonResponse
from db import platform_settings_repo
# pyrefly: ignore [missing-import]
from apps.accounts.authentication import MongoJWTAuthentication


class MaintenanceModeMiddleware:
    """Middleware to enforce Maintenance Mode for non-admin users."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info.lower()

        # Exempt endpoints that should remain accessible during maintenance
        exempt_paths = [
            '/api/platform/settings/public',
            '/api/admin/',
            '/api/auth/login',
            '/api/auth/token',
            '/api/auth/refresh',
            '/api/health',
            '/media/',
            '/static/',
        ]

        if any(path.startswith(p) for p in exempt_paths):
            return self.get_response(request)

        try:
            settings_data = platform_settings_repo.get_platform_settings()
            if settings_data.get('maintenance_mode'):
                user = None
                try:
                    auth_result = MongoJWTAuthentication().authenticate(request)
                    if auth_result:
                        user = auth_result[0]
                except Exception:
                    pass

                role = getattr(user, 'role', None)
                if role != 'admin' and role != 'super_admin':
                    return JsonResponse({
                        'status': 'error',
                        'message': 'MoveSmart is currently undergoing scheduled platform maintenance. Non-admin access is temporarily restricted.',
                        'code': 'maintenance_mode'
                    }, status=503)
        except Exception:
            pass

        return self.get_response(request)
