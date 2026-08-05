"""apps/cms/views.py — DRF views for CMS Content Manager (Phase 14)"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsAdmin
from db import cms_repo, audit_repo


class CMSPageView(APIView):
    """GET / PUT /api/admin/cms/:slug — Get or update CMS content page."""
    permission_classes = [IsAdmin]

    def get(self, request, slug):
        cms_doc = cms_repo.get_cms_page(slug)
        return api_response(data=cms_doc, message=f"CMS content for '{slug}' retrieved.")

    def put(self, request, slug):
        title = request.data.get("title", slug.capitalize())
        content = request.data.get("content", {})

        updated = cms_repo.update_cms_page(slug, title, content, str(request.user.id))

        audit_repo.log_admin_action(
            actor_id=str(request.user.id),
            actor_email=request.user.email,
            action="cms_update",
            target_type="cms",
            target_id=slug,
            details=f"CMS page '{slug}' updated"
        )
        return api_response(data=updated, message=f"CMS content for '{slug}' updated successfully.")
