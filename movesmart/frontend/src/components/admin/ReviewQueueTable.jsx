// components/admin/ReviewQueueTable.jsx — Table listing all pending_review listings for Admin (new v2.0, PRD §7.5, Architecture.md §4.5)
// Fetches from GET /api/admin/listings?status=pending_review
// Only visible to admin-role accounts — enforced server-side via role permission class (FR-4)
// TODO: display: listing title, owner, submitted_at, deal_type, price, locality
// TODO: row actions: view detail, trigger ApproveRejectPanel
function ReviewQueueTable() {
  return <div>ReviewQueueTable — TODO</div>;
}
export default ReviewQueueTable;
