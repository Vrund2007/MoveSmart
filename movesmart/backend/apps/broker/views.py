"""apps/broker/views.py — DRF views for Broker / Agent CRM Module (Architecture.md §4.3, PRD §7, Phase 11)"""
import csv
from io import StringIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsBroker
from db import (
    listings_repo,
    leads_repo,
    commissions_repo,
    clients_repo,
    tasks_repo,
    visits_repo,
    reports_repo
)
from apps.recommendations.scoring import score_localities
from .services import get_crm_dashboard_summary
from .serializers import (
    BrokerListingCreateSerializer,
    LeadStatusSerializer,
    CommissionCreateSerializer,
    ClientMatchSerializer,
    ClientSerializer,
    TaskSerializer
)


class BrokerDashboardView(APIView):
    """GET /api/broker/dashboard — Aggregated CRM Dashboard summary widgets."""
    permission_classes = [IsBroker]

    def get(self, request):
        summary = get_crm_dashboard_summary(str(request.user.id))
        return api_response(data=summary, message="Broker CRM Dashboard metrics retrieved.")


class BrokerListingsView(APIView):
    """GET /api/broker/listings — view broker-managed inventory.
    POST /api/broker/listings — submit listing on behalf of property owner.
    """
    permission_classes = [IsBroker]

    def get(self, request):
        listings = listings_repo.get_listings_by_broker(str(request.user.id))
        return api_response(data=listings, message="Broker managed inventory retrieved.")

    def post(self, request):
        serializer = BrokerListingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        listing_data = serializer.validated_data
        listing_data["submitted_by_broker_id"] = str(request.user.id)
        listing_data["status"] = "pending_review"  # Broker cannot bypass review (FR-4)
        listing_data["source"] = "platform"

        created = listings_repo.create_listing(listing_data)
        return api_response(data=created, message="Listing submitted for Admin review.", status_code=status.HTTP_201_CREATED)


class BrokerListingDetailView(APIView):
    """PUT /api/broker/listings/:id — update broker listing.
    DELETE /api/broker/listings/:id — delete broker listing.
    """
    permission_classes = [IsBroker]

    def put(self, request, listing_id):
        existing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not existing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if str(existing.get("submitted_by_broker_id")) != str(request.user.id):
            return api_response(message="Permission denied. You can only manage your own listings.", status_code=status.HTTP_403_FORBIDDEN)

        serializer = BrokerListingCreateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        update_data = serializer.validated_data
        if existing.get("status") == "rejected":
            updated = listings_repo.resubmit_listing(listing_id, update_data)
        else:
            updated = listings_repo.update_listing(listing_id, update_data)

        return api_response(data=updated, message="Listing updated.")

    def delete(self, request, listing_id):
        existing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not existing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if str(existing.get("submitted_by_broker_id")) != str(request.user.id):
            return api_response(message="Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

        success = listings_repo.delete_listing(listing_id)
        if not success:
            return api_response(message="Failed to delete listing.", status_code=status.HTTP_400_BAD_REQUEST)

        return api_response(message="Listing deleted successfully.")


class ClientsView(APIView):
    """GET /api/broker/clients — List broker clients.
    POST /api/broker/clients — Create new client.
    """
    permission_classes = [IsBroker]

    def get(self, request):
        status_filter = request.query_params.get("status")
        search = request.query_params.get("search")
        favorite_only = request.query_params.get("favorite") == "true"
        clients = clients_repo.get_broker_clients(
            broker_id=str(request.user.id),
            status=status_filter,
            search=search,
            favorite_only=favorite_only
        )
        return api_response(data=clients, message="Broker clients retrieved successfully.")

    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        client_data = serializer.validated_data
        client_data["broker_id"] = str(request.user.id)
        created = clients_repo.create_client(client_data)
        return api_response(data=created, message="Client registered successfully.", status_code=status.HTTP_201_CREATED)


class ClientDetailView(APIView):
    """GET / PUT / DELETE /api/broker/clients/:id — Client management detail."""
    permission_classes = [IsBroker]

    def get(self, request, client_id):
        client = clients_repo.get_client_by_id(client_id, str(request.user.id))
        if not client:
            return api_response(message="Client record not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(data=client, message="Client profile retrieved.")

    def put(self, request, client_id):
        serializer = ClientSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        updated = clients_repo.update_client(client_id, str(request.user.id), serializer.validated_data)
        if not updated:
            return api_response(message="Client record not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated, message="Client profile updated successfully.")

    def delete(self, request, client_id):
        success = clients_repo.delete_client(client_id, str(request.user.id))
        if not success:
            return api_response(message="Client record not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Client profile deleted successfully.")


class ClientNoteView(APIView):
    """POST /api/broker/clients/:id/notes — Add note to client timeline."""
    permission_classes = [IsBroker]

    def post(self, request, client_id):
        note_text = request.data.get("note", "").strip()
        if not note_text:
            return api_response(message="Note text is required.", status_code=status.HTTP_400_BAD_REQUEST)

        updated = clients_repo.add_client_note(client_id, str(request.user.id), note_text)
        if not updated:
            return api_response(message="Client record not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated, message="Note added to client timeline.")


class LeadsView(APIView):
    """GET /api/leads?broker=me — Broker's lead pipeline."""
    permission_classes = [IsBroker]

    def get(self, request):
        leads = leads_repo.get_broker_leads(str(request.user.id))
        return api_response(data=leads, message="Broker leads retrieved.")


class LeadDetailView(APIView):
    """PATCH /api/leads/:id — update lead status, notes, or priority."""
    permission_classes = [IsBroker]

    def patch(self, request, lead_id):
        serializer = LeadStatusSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        v_data = serializer.validated_data
        broker_id = str(request.user.id)

        # 1. Update status if specified
        if "lead_status" in v_data:
            try:
                success = leads_repo.update_lead_status(lead_id, broker_id, v_data["lead_status"])
                if not success:
                    return api_response(message="Lead not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)
            except ValueError as val_err:
                return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)

        # 2. Update priority, note, or tags
        updated = leads_repo.update_lead_details(lead_id, broker_id, v_data)
        if not updated and "lead_status" not in v_data:
            return api_response(message="Lead not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated or {}, message="Lead updated successfully.")


class TasksView(APIView):
    """GET /api/broker/tasks — Fetch broker tasks.
    POST /api/broker/tasks — Create a task.
    """
    permission_classes = [IsBroker]

    def get(self, request):
        status_filter = request.query_params.get("status")
        priority_filter = request.query_params.get("priority")
        tasks = tasks_repo.get_broker_tasks(str(request.user.id), status=status_filter, priority=priority_filter)
        return api_response(data=tasks, message="Broker tasks retrieved.")

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        task_data = serializer.validated_data
        task_data["broker_id"] = str(request.user.id)
        created = tasks_repo.create_task(task_data)
        return api_response(data=created, message="Task created successfully.", status_code=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    """PATCH / DELETE /api/broker/tasks/:id — Manage task."""
    permission_classes = [IsBroker]

    def patch(self, request, task_id):
        serializer = TaskSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        updated = tasks_repo.update_task(task_id, str(request.user.id), serializer.validated_data)
        if not updated:
            return api_response(message="Task not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated, message="Task updated successfully.")

    def delete(self, request, task_id):
        success = tasks_repo.delete_task(task_id, str(request.user.id))
        if not success:
            return api_response(message="Task not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Task deleted successfully.")


class CommissionsView(APIView):
    """POST /api/commissions — log commission for converted lead.
    GET /api/commissions — broker's own commission records.
    """
    permission_classes = [IsBroker]

    def post(self, request):
        serializer = CommissionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        data['broker_id'] = str(request.user.id)
        try:
            created = commissions_repo.create_commission(data)
            return api_response(data=created, message="Commission recorded.", status_code=status.HTTP_201_CREATED)
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        commissions = commissions_repo.get_broker_commissions(str(request.user.id))
        return api_response(data=commissions, message="Commissions retrieved.")


class CommissionDetailView(APIView):
    """PATCH /api/commissions/:id — update payment status ('pending' -> 'paid')."""
    permission_classes = [IsBroker]

    def patch(self, request, commission_id):
        new_status = request.data.get("payment_status")
        if new_status not in ["pending", "paid"]:
            return api_response(message="payment_status must be 'pending' or 'paid'.", status_code=status.HTTP_400_BAD_REQUEST)

        success = commissions_repo.update_payment_status(commission_id, str(request.user.id), new_status)
        if not success:
            return api_response(message="Commission record not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(message=f"Commission payment status updated to {new_status}.")


class BrokerAnalyticsView(APIView):
    """GET /api/broker/analytics — PyMongo performance analytics & aggregations."""
    permission_classes = [IsBroker]

    def get(self, request):
        analytics = reports_repo.generate_performance_analytics(str(request.user.id))
        return api_response(data=analytics, message="Broker performance analytics retrieved.")


class BrokerReportsView(APIView):
    """GET /api/broker/reports — Generate lead, commission, listing, or visit report (JSON)."""
    permission_classes = [IsBroker]

    def get(self, request):
        report_type = request.query_params.get("type", "leads")
        broker_id = str(request.user.id)

        if report_type == "leads":
            data = reports_repo.generate_lead_report(broker_id)
        elif report_type == "commissions":
            data = reports_repo.generate_commission_report(broker_id)
        elif report_type == "listings":
            data = reports_repo.generate_listing_report(broker_id)
        elif report_type == "visits":
            data = reports_repo.generate_visit_report(broker_id)
        else:
            data = reports_repo.generate_performance_analytics(broker_id)

        return api_response(data={"report_type": report_type, "content": data}, message=f"Broker {report_type} report generated.")


class BrokerReportExportView(APIView):
    """GET /api/broker/reports/export — Download CSV export of report."""
    permission_classes = [IsBroker]

    def get(self, request):
        report_type = request.query_params.get("type", "leads")
        broker_id = str(request.user.id)

        output = StringIO()
        writer = csv.writer(output)

        if report_type == "leads":
            rep = reports_repo.generate_lead_report(broker_id)
            writer.writerow(["Lead ID", "Seeker Name", "Contact Email", "Contact Phone", "Lead Status"])
            for l in rep.get("recent_leads", []):
                writer.writerow([l.get("_id"), l.get("seeker_name"), l.get("seeker_email"), l.get("seeker_phone"), l.get("lead_status")])

        elif report_type == "commissions":
            rep = reports_repo.generate_commission_report(broker_id)
            writer.writerow(["Commission ID", "Lead ID", "Amount (INR)", "Payment Status", "Deal Date"])
            for c in rep.get("commissions", []):
                writer.writerow([c.get("_id"), c.get("lead_id"), c.get("amount"), c.get("payment_status"), c.get("deal_date")])

        else:
            rep = reports_repo.generate_listing_report(broker_id)
            writer.writerow(["Locality", "Listing Count"])
            for loc in rep.get("locality_distribution", []):
                writer.writerow([loc.get("locality"), loc.get("count")])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="broker_{report_type}_report.csv"'
        return response


class ClientMatchView(APIView):
    """POST /api/broker/client-match — Match client requirements with localities & approved listings.
    REUSES apps/recommendations/scoring.py (FR-8).
    """
    permission_classes = [IsBroker]

    def post(self, request):
        serializer = ClientMatchSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        profile = serializer.validated_data
        approved = listings_repo.get_approved_listings()

        localities_map = {}
        for l in approved:
            loc = l.get("locality")
            if loc:
                localities_map[loc] = localities_map.get(loc, 0) + 1

        localities_list = [{"locality": k, "listings_count": v} for k, v in localities_map.items()]
        top_localities = score_localities(profile, localities_list)

        top_locality_names = {item["locality"] for item in top_localities}
        matched_listings = [
            l for l in approved if l.get("locality") in top_locality_names and l.get("price", 0) <= profile["rent_budget"] * 1.2
        ]

        return api_response(
            data={
                "recommended_localities": top_localities,
                "matched_properties": matched_listings[:5]
            },
            message="Client match recommendations computed successfully."
        )
