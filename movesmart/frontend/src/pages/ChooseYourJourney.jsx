// pages/ChooseYourJourney.jsx — Role selection screen shown after signup (new v2.0, PRD §6, Architecture.md §4.0)
// Uses ChooseYourJourneyCard component for each of 4 public roles
// Admin is NEVER shown here (FR-2) — enforced both in this UI and server-side
// Sends PATCH /api/auth/role with chosen role
// TODO: render 4 ChooseYourJourneyCard components for: find_accommodation, property_owner, broker, company_hr
// TODO: on selection + confirm, call setRole() and redirect to /onboarding
function ChooseYourJourney() {
  return <div>ChooseYourJourney — TODO</div>;
}
export default ChooseYourJourney;
