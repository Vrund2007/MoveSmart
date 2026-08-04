"""apps/accounts/views.py — DRF views for auth, registration, role assignment (PRD §6, Architecture.md §4.0, FR-1, FR-2)"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.responses import api_response
from .serializers import (
    RegisterSerializer, LoginSerializer, RoleSerializer, PROFILE_SERIALIZER_MAP
)
from . import services, repository


class RegisterView(APIView):
    """POST /api/auth/register — create account (email + password only at this step)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        try:
            user_doc, tokens = services.register_user(
                email=data['email'],
                password=data['password']
            )
        except services.DuplicateEmailError as exc:
            return api_response(
                errors={'email': str(exc)},
                message=str(exc),
                status_code=status.HTTP_409_CONFLICT
            )

        return api_response(
            data={'user': user_doc, **tokens},
            message="Account registered successfully.",
            status_code=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """POST /api/auth/login — authenticate and return JWT."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        try:
            safe_user, tokens = services.authenticate_user(
                email=data['email'],
                password=data['password']
            )
        except services.InvalidCredentialsError as exc:
            return api_response(
                errors={'detail': str(exc)},
                message=str(exc),
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        return api_response(
            data={'user': safe_user, **tokens},
            message="Authenticated successfully.",
            status_code=status.HTTP_200_OK
        )


class RefreshView(APIView):
    """POST /api/auth/refresh — exchange refresh token for a new access token."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return api_response(
                message="Refresh token is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        try:
            refresh = RefreshToken(refresh_token)
            return api_response(
                data={'access': str(refresh.access_token)},
                message="Access token refreshed successfully.",
                status_code=status.HTTP_200_OK
            )
        except Exception as exc:
            return api_response(
                errors={'detail': str(exc)},
                message="Invalid or expired refresh token.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """POST /api/auth/logout — clean client token logout."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return api_response(
            message="Logout successful. Tokens cleared from client.",
            status_code=status.HTTP_200_OK
        )


class SetRoleView(APIView):
    """PATCH /api/auth/role — set role once after signup (FR-1); 'admin' excluded (FR-2)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = RoleSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        role = serializer.validated_data['role']
        user_id = request.user.id

        try:
            updated_user = services.assign_role(user_id=user_id, role=role)
        except services.RoleImmutableError as exc:
            return api_response(
                errors={'detail': str(exc)},
                message=str(exc),
                status_code=status.HTTP_409_CONFLICT
            )

        return api_response(
            data={'user': updated_user},
            message="Role assigned successfully.",
            status_code=status.HTTP_200_OK
        )


class ProfileView(APIView):
    """GET /api/profile — read role-specific profile.
       PUT /api/profile — update role-specific profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = repository.get_user_by_id(request.user.id)
        if not user:
            return api_response(
                message="User not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        return api_response(
            data={'user': user},
            message="User profile retrieved successfully."
        )

    def put(self, request):
        user_role = request.user.role
        if not user_role:
            return api_response(
                message="Role must be selected before updating role profile.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        SerializerClass = PROFILE_SERIALIZER_MAP.get(user_role)
        if not SerializerClass:
            return api_response(
                message=f"No profile fields defined for role '{user_role}'.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        serializer = SerializerClass(data=request.data)
        if not serializer.is_valid():
            return api_response(
                errors=serializer.errors,
                message="Validation error",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        updated_user = services.update_profile(
            user_id=request.user.id,
            profile_data=serializer.validated_data
        )

        return api_response(
            data={'user': updated_user},
            message="Role profile updated successfully."
        )
