// components/company/BudgetTracker.jsx — Real-time budget tracking for a relocation batch (new v2.0, PRD §7.4, Architecture.md §4.4)
// budget-used is computed server-side (sum of allocations[].cost) — not stored, to avoid drift (database.md §3.7)
// Apply tabular-nums to all budget figures (Design.md §3.4)
// TODO: accept budget, budgetUsed, budgetRemaining props (fetched from GET /api/company/relocation-batches/:id)
// TODO: show progress bar and remaining amount
function BudgetTracker() {
  return <div>BudgetTracker — TODO</div>;
}
export default BudgetTracker;
