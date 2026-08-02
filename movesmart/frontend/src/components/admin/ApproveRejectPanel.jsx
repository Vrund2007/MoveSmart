// components/admin/ApproveRejectPanel.jsx — Approve/reject panel for a single listing (new v2.0, PRD §7.5, Architecture.md §4.5)
// Sends PATCH /api/admin/listings/:id/review with { decision, reason }
// On rejection: reason is required and surfaced to the submitting Owner/Broker (FR-5)
// TODO: implement approve button (no reason needed) and reject form (reason required)
// TODO: on action, update listing status and remove from queue
function ApproveRejectPanel() {
  return <div>ApproveRejectPanel — TODO</div>;
}
export default ApproveRejectPanel;
