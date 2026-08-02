"""apps/accounts/views.py — DRF views for auth, registration, role assignment (PRD §6, Architecture.md §4.0, FR-1, FR-2)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
import pymongo.errors

from db import users_repo
from .serializers import (
    RegisterSerializer, LoginSerializer, RoleSerializer, PROFILE_SERIALIZER_MAP
)


def _tokens_for_user(user_id: str) -> dict:
    """Issue a simplejwt access + refresh token pair for the given MongoDB user_id."""
    refresh = RefreshToken()
    refresh['user_id'] = user_id   # custom claim — MongoJWTAuthentication reads this
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    }


class RegisterView(APIView):
    """POST /api/auth/register — create account (email + password only at this step)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        password_hash = make_password(data['password'])

        try:
            user = users_repo.create_user(
                email=data['email'],
                password_hash=password_hash,
            )
        except pymongo.errors.DuplicateKeyError:
            return Response(
                {'email': 'An account with this email already exists.'},
                status=status.HTTP_409_CONFLICT
            )

        tokens = _tokens_for_user(user['_id'])
        return Response({'user': user, **tokens}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login — authenticate and return JWT."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user_doc = users_repo.get_user_by_email(data['email'])

        if not user_doc or not check_password(data['password'], user_doc.get('password_hash', '')):
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Build safe user dict (strip password_hash before sending)
        safe_user = {k: v for k, v in user_doc.items() if k != 'password_hash'}
        safe_user['_id'] = str(safe_user['_id'])

        tokens = _tokens_for_user(safe_user['_id'])
        return Response({'user': safe_user, **tokens}, status=status.HTTP_200_OK)


class RefreshView(APIView):
    """POST /api/auth/refresh — exchange refresh token for a new access token."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            return Response({'access': str(refresh.access_token)}, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_401_UNAUTHORIZED)


class SetRoleView(APIView):
    """PATCH /api/auth/role — set role once after signup (FR-1); 'admin' excluded (FR-2)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = RoleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        role = serializer.validated_data['role']
        user_id = request.user.id   # set by MongoJWTAuthentication

        try:
            updated_user = users_repo.set_role(user_id, role)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_409_CONFLICT)

        return Response({'user': updated_user}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """GET /api/profile — read role-specific profile.
       PUT /api/profile — update role-specific profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = users_repo.get_user_by_id(request.user.id)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'user': user}, status=status.HTTP_200_OK)

    def put(self, request):
        user_role = request.user.role
        SerializerClass = PROFILE_SERIALIZER_MAP.get(user_role)
        if not SerializerClass:
            return Response(
                {'detail': f'No profile fields defined for role \'{user_role}\'.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SerializerClass(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        updated_user = users_repo.update_role_profile(
            request.user.id, serializer.validated_data
        )
        return Response({'user': updated_user}, status=status.HTTP_200_OK)
