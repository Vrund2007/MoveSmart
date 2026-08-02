// pages/Onboarding.jsx — Renders the correct onboarding component based on the user's role (PRD §6, Architecture.md §4.0)
// Reads role from AuthContext and renders the matching onboarding form
// TODO: import and conditionally render:
//   role === 'find_accommodation' → FindAccommodationOnboarding
//   role === 'property_owner' → PropertyOwnerOnboarding
//   role === 'broker' → BrokerOnboarding
//   role === 'company_hr' → CompanyHrOnboarding
// TODO: redirect to role dashboard on onboarding completion
function Onboarding() {
  return <div>Onboarding — TODO (renders role-specific onboarding)</div>;
}
export default Onboarding;
