"""apps/accounts/authentication.py — Custom JWT authentication backed by MongoDB.

simplejwt's default JWTAuthentication calls Django's ORM to look up the user.
Since we have no ORM model (Architecture.md §2 — PyMongo only), we override get_user()
to fetch from MongoDB instead.

The JWT payload contains 'user_id' (the string form of MongoDB ObjectId).
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from db import users_repo


class _MongoUser:
    """A minimal user-like object that satisfies DRF's permission checks.
    We don't use Django's User model — this wraps a MongoDB user document.
    """
    def __init__(self, doc: dict):
        self._doc = doc
        self.id = doc.get('_id')          # str
        self.pk = self.id                  # DRF compatibility
        self.email = doc.get('email', '')
        self.role = doc.get('role')
        self.role_profile = doc.get('role_profile', {})
        self.is_authenticated = True
        self.is_anonymous = False
        self.is_active = True

    def __str__(self):
        return self.email


class MongoJWTAuthentication(JWTAuthentication):
    """JWT authentication that loads the user from MongoDB instead of Django ORM."""

    def get_user(self, validated_token):
        """Fetch user from MongoDB using the 'user_id' claim in the JWT payload."""
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise InvalidToken("Token contains no 'user_id' claim")

            doc = users_repo.get_user_by_id(str(user_id))
            if doc is None:
                raise AuthenticationFailed("User not found", code="user_not_found")

            return _MongoUser(doc)

        except (KeyError, Exception) as exc:
            raise InvalidToken(str(exc)) from exc
