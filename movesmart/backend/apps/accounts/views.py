"""apps/accounts/views.py — DRF views for auth, registration, role assignment (PRD §6, Architecture.md §4.0, FR-1, FR-2)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated


class RegisterView(APIView):
    """POST /api/auth/register — create account (email + password only at this step)."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO: validate email/password via RegisterSerializer
        # TODO: hash password using Django's make_password
        # TODO: write user document to MongoDB via db.users_repo.create_user()
        # TODO: issue JWT access token and return it
        pass


class LoginView(APIView):
    """POST /api/auth/login — authenticate and return JWT."""
    permission_classes = [AllowAny]

    def post(self, request):
        # TODO: validate credentials via LoginSerializer
        # TODO: verify password hash via db.users_repo.get_user_by_email()
        # TODO: issue JWT and return it
        pass


class SetRoleView(APIView):
    """PATCH /api/auth/role — set role once after signup (FR-1); 'admin' excluded (FR-2)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # TODO: validate role via RoleSerializer (which excludes 'admin' from choices — FR-2)
        # TODO: reject if users.role is already set (immutable from client — FR-1)
        # TODO: write role to MongoDB via db.users_repo.set_role()
        pass


class ProfileView(APIView):
    """GET /api/profile and PUT /api/profile — read/write role-specific profile data."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: fetch user profile from db.users_repo.get_user_by_id()
        # TODO: return role_profile fields only (never password_hash — Rules.md §3)
        pass

    def put(self, request):
        # TODO: validate profile fields via role-specific ProfileSerializer
        # TODO: update role_profile subdocument in MongoDB
        pass
