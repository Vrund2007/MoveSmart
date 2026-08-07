# Frontend — Codebase Understanding

The `frontend/` folder is a **React 18** single-page application built with **Create React App** (react-scripts), styled with **Tailwind CSS**, and animated with **GSAP** and **Three.js**. It communicates with the Django backend via an **Axios** instance (`lib/api.js`). Role-based routing (`ProtectedRoute`) enforces access control client-side, with the server enforcing the same rules on every API call. The app has five distinct role dashboards: seeker (find_accommodation), property owner, company HR, broker (redirects to seeker), and super admin.

---

## Folder Tree

```
frontend/
├── package.json
├── tailwind.config.js
├── .eslintrc.json
├── .env
│
├── public/                    ← Static HTML shell, favicon, manifest
│
├── build/                     ← Production build output (generated, not edited)
│
└── src/
    ├── index.jsx              ← React DOM root mount
    ├── App.jsx                ← Router shell, ProtectedRoute, role-based routing
    │
    ├── api/                   ← API client modules (one per backend domain)
    │   ├── auth.js            ← /api/auth/* wrappers
    │   ├── listings.js        ← /api/listings/* wrappers (with 5-min cache)
    │   ├── admin.js           ← Admin review/moderation wrappers
    │   ├── adminDashboard.js  ← Admin KPI/analytics wrappers
    │   ├── analytics.js       ← Analytics API wrappers
    │   ├── approvals.js       ← Approval workflow wrappers
    │   ├── assistant.js       ← AI chat assistant wrappers
    │   ├── audit.js           ← Audit log wrappers
    │   ├── calendar.js        ← Calendar event wrappers
    │   ├── cms.js             ← CMS content wrappers
    │   ├── commute.js         ← Commute calculator wrappers
    │   ├── company.js         ← Company HR portal wrappers
    │   ├── companyReports.js  ← Company reports wrappers
    │   ├── costOfLiving.js    ← Cost of living wrappers
    │   ├── employees.js       ← Employee management wrappers
    │   ├── enquiries.js       ← Enquiry wrappers
    │   ├── expenses.js        ← Expense tracking wrappers
    │   ├── feedback.js        ← Feedback wrappers
    │   ├── messages.js        ← Messaging wrappers
    │   ├── ml.js              ← ML inference wrappers
    │   ├── notifications.js   ← Notification wrappers
    │   ├── ownerVisits.js     ← Owner-side visit wrappers
    │   ├── platform.js        ← Platform settings wrappers
    │   ├── profile.js         ← Profile wrappers
    │   ├── recommendations.js ← Recommendations wrappers
    │   ├── reports.js         ← Reports wrappers
    │   ├── savedListings.js   ← Saved listings wrappers
    │   ├── search.js          ← Global search wrappers
    │   ├── tasks.js           ← Task management wrappers
    │   ├── users.js           ← User management wrappers
    │   ├── visits.js          ← Visit scheduling wrappers
    │   └── activity.js        ← Activity feed wrappers
    │
    ├── context/               ← React context providers
    │   ├── AuthContext.jsx    ← User auth state, login/logout/register
    │   ├── ProfileContext.jsx ← Role-specific profile data
    │   └── UserContext.jsx    ← Lightweight user context alias
    │
    ├── hooks/                 ← Custom React hooks
    │   ├── useAuth.js         ← Consumes AuthContext
    │   └── useScrolledPastHero.js  ← Scroll position detection
    │
    ├── lib/                   ← Core infrastructure
    │   └── api.js             ← Axios instance with auth interceptors
    │
    ├── pages/                 ← Full-page route components (24 files)
    │   ├── Landing.jsx
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── ChooseYourJourney.jsx
    │   ├── Onboarding.jsx
    │   ├── Dashboard.jsx
    │   ├── ListingDetail.jsx
    │   ├── SavedListings.jsx
    │   ├── OwnerDashboard.jsx
    │   ├── CompanyDashboard.jsx
    │   ├── AdminDashboard.jsx
    │   ├── AdminReviewQueue.jsx
    │   ├── Notifications.jsx
    │   ├── Messages.jsx
    │   ├── Calendar.jsx
    │   ├── Search.jsx
    │   ├── Reports.jsx
    │   ├── Activity.jsx
    │   ├── Settings.jsx
    │   ├── Profile.jsx
    │   ├── CompareListings.jsx
    │   ├── Inbox.jsx
    │   ├── VisitScheduler.jsx
    │   └── NotFound.jsx
    │
    ├── components/            ← Reusable UI components (21 subdirectories)
    │   ├── admin/             ← Admin panel components
    │   ├── assistant/         ← AI chat widget
    │   ├── auth/              ← Auth flow components
    │   ├── city-story/        ← Empty (placeholder)
    │   ├── common/            ← Shared layout & UI primitives
    │   ├── commute/           ← Commute calculator panel
    │   ├── company/           ← Company HR components
    │   ├── cost/              ← Cost breakdown table
    │   ├── crm/               ← Broker CRM components
    │   ├── dashboard/         ← Hub hero carousel
    │   ├── enquiries/         ← Enquiry form & list
    │   ├── hero/              ← City hero animation
    │   ├── listings/          ← Listing card, filters, badges
    │   ├── ml/                ← Rent prediction & trust cards
    │   ├── onboarding/        ← Role-specific onboarding forms
    │   ├── owner/             ← Owner dashboard components
    │   ├── recommendations/   ← Locality score components
    │   ├── sections/          ← Landing page sections
    │   ├── seeker/            ← Seeker comparison table
    │   ├── shared/            ← Cross-role shared widgets
    │   └── ui/                ← Pure UI utilities (cursor, loader)
    │
    ├── styles/
    │   └── globals.css        ← Tailwind + CSS custom properties + animations
    │
    └── utils/
        ├── mockData.js        ← Demo locality data for landing page
        ├── razorpay.js        ← Razorpay payment flow helper
        └── user.js            ← getUserDisplayName() utility
```

---

## `src/index.jsx`
- Entry point — mounts `<App />` into `#root` DOM node
- Imports `styles/globals.css`

---

## `src/App.jsx`
- **Router shell** — wraps everything in `<BrowserRouter>`, `<AuthProvider>`, `<ProfileProvider>`, `<MaintenanceNoticeGuard>`
- `getRoleDashboard(role)` — maps role to home route (`/dashboard`, `/owner`, `/company`, `/admin`)
- `MaintenanceNoticeGuard` — polls `GET /api/platform/settings/public` on every route change; shows maintenance screen to non-admins if `maintenance_mode=true`
- `ProtectedRoute` — enforces 3-step guard:
  1. Redirect to `/login` if not authenticated
  2. Redirect to `/choose-your-journey` if no role set
  3. Redirect to `/onboarding` if `role_profile` is empty
- Route map:
  - Public: `/`, `/signup`, `/login`
  - Post-auth flow: `/choose-your-journey`, `/onboarding`
  - Seeker: `/dashboard`, `/listings/:id`, `/saved`
  - Owner: `/owner`
  - Broker: `/broker` → redirects to `/dashboard`
  - Company HR: `/company`
  - Admin: `/admin`, `/admin/dashboard`, `/admin/review`
  - Shared: `/notifications`, `/messages`, `/calendar`, `/search`, `/reports`, `/activity`, `/settings`

---

## `src/lib/` — Core Infrastructure

### `lib/api.js`
- Axios instance with `baseURL = REACT_APP_API_URL || '/api'`
- **Request interceptor**: attaches `Authorization: Bearer <access_token>` from localStorage
- **Response interceptor**: on 401, attempts token refresh via `POST /api/auth/refresh`; on refresh failure, clears localStorage and redirects to `/login`
- **Env var**: `REACT_APP_API_URL` — defaults to `/api` (proxied to `http://localhost:8000` in dev)
- **Key exports**: `default api` (Axios instance)

---

## `src/context/` — React Context Providers

### `context/AuthContext.jsx`
- `AuthContext` — carries user identity and auth state throughout the app
- `AuthProvider` — state: `user`, `loading`
- On mount: restores session by calling `GET /api/profile` if `access_token` exists in localStorage
- Syncs `user` ↔ `localStorage.user` on every change
- Exported functions:
  - `login(email, password)` — calls `POST /api/auth/login`, stores tokens
  - `register(name, email, password, confirmPassword)` — calls `POST /api/auth/register`
  - `setRole(role)` — calls `PATCH /api/auth/role`
  - `updateProfile(profileData)` — calls `PUT /api/profile`
  - `logout()` — calls `POST /api/auth/logout`, clears localStorage
  - `unlockFeatureInUser(feature)` — adds feature to `user.unlocked_features` array (client-side update after Razorpay payment)
- `useAuth()` — convenience hook (also exported from `hooks/useAuth.js`)

### `context/ProfileContext.jsx`
- `ProfileProvider` — state: `profile` (role-specific data), `loading`
- `loadProfile()` — calls `GET /api/auth/profile`, sets `profile = res.data.user?.role_profile`
- `updateProfile(data)` — calls `PUT /api/auth/profile`
- Used by Profile page and onboarding forms to read/update role_profile

### `context/UserContext.jsx`
- Lightweight alias context for user state — wraps `AuthContext` for convenience in some components

---

## `src/hooks/` — Custom Hooks

### `hooks/useAuth.js`
- Re-exports `useAuth()` from `context/AuthContext.jsx` — thin convenience wrapper
- Throws error if used outside `AuthProvider`

### `hooks/useScrolledPastHero.js`
- `useScrolledPastHero(threshold?)` — returns `true` when `window.scrollY > threshold` (default: `window.innerHeight`)
- Used by `Navbar.jsx` to switch from transparent → solid background after scrolling past the hero section
- Uses passive scroll listener for performance

---

## `src/api/` — API Client Modules

Every file in `api/` imports `api` from `lib/api.js` and exports thin async functions that wrap specific backend endpoints.

### `api/auth.js`
- `registerUser(data)` — `POST /api/auth/register`
- `loginUser(data)` — `POST /api/auth/login`
- `logoutUser()` — `POST /api/auth/logout` (fails silently)
- `refreshToken(refresh)` — `POST /api/auth/refresh`
- `setUserRole(role)` — `PATCH /api/auth/role`
- `getUserProfile()` — `GET /api/profile`
- `updateUserProfile(profileData)` — `PUT /api/profile`
- `googleAuthUser(googlePayload)` — `POST /api/auth/google`
- `changePassword({old_password, new_password})` — `POST /api/auth/change-password`
- `deleteAccount({password})` — `POST /api/auth/delete-account`

### `api/listings.js`
- **Has a 5-minute in-memory cache** for default (no-param) listing fetches
- `getListings(params, forceRefresh)` — `GET /api/listings` with optional filters; cached for 5 min
- `getMyListings()` — `GET /api/listings/my`
- `getListingById(id)` — `GET /api/listings/:id`
- `getListing` — alias for `getListingById`
- `createListing(listingData)` — `POST /api/listings`
- `updateListing(id, listingData)` — `PUT /api/listings/:id`
- `deleteListing(id)` — `DELETE /api/listings/:id`
- `getListingAnalytics(id)` — `GET /api/listings/:id/analytics`
- `saveListing(listingId)` — `POST /api/saved-listings`
- `getSavedListings()` — `GET /api/saved-listings`
- `removeSavedListing(savedId)` — `DELETE /api/saved-listings/:savedId`

### `api/admin.js`
- Admin review queue operations (fetch pending listings, approve, reject)

### `api/adminDashboard.js`
- Admin platform KPI and analytics fetch functions

### `api/analytics.js`
- Platform analytics data

### `api/approvals.js`
- Approval workflow endpoint wrappers

### `api/assistant.js`
- `sendChatMessage(message)` — `POST /api/assistant/chat`

### `api/audit.js`
- `getAuditLogs()` — `GET /api/audit/logs`

### `api/calendar.js`
- CRUD for calendar events

### `api/cms.js`
- CMS content fetch and update

### `api/commute.js`
- `getCommuteEstimate(origin, destination, mode)` — `POST /api/commute`

### `api/company.js`
- Largest API module — employee CRUD, relocation batches, bulk search, client/lead/commission management

### `api/companyReports.js`
- Company analytics and report generation

### `api/costOfLiving.js`
- `getCostOfLiving(params)` — `POST /api/cost-of-living`

### `api/employees.js`
- Employee management: list, create, update, delete, assign

### `api/enquiries.js`
- `submitEnquiry(data)` — `POST /api/enquiries`
- `getEnquiries()` — `GET /api/enquiries`

### `api/expenses.js`
- Relocation expense CRUD

### `api/feedback.js`
- Feedback submission and retrieval

### `api/messages.js`
- Conversations list, messages per conversation, send message

### `api/ml.js`
- `getRentPrediction(listingData)` — ML rent valuation
- `getSuspiciousFlag(listingData)` — ML fraud detection

### `api/notifications.js`
- `getNotifications()`, `markNotificationRead(id)`

### `api/ownerVisits.js`
- Owner-facing: `GET /api/owner/visits/`

### `api/platform.js`
- `getPublicPlatformSettings()` — `GET /api/platform/settings/public` (no auth required — used by `MaintenanceNoticeGuard`)
- `getPlatformSettings()`, `updatePlatformSettings(data)`

### `api/profile.js`
- `getProfile()`, `updateProfile(data)` — profile CRUD

### `api/recommendations.js`
- `getRecommendations()` — `GET /api/recommendations`

### `api/reports.js`
- Reports fetch and generation

### `api/savedListings.js`
- Save/unsave/list saved listings (mirrors `listings.js` savedListings functions)

### `api/search.js`
- `globalSearch(query)` — `GET /api/search?q=...`

### `api/tasks.js`
- Broker task management CRUD

### `api/users.js`
- Admin user management: list users, update roles, deactivate

### `api/visits.js`
- Seeker-facing: schedule visit, list visits, update visit

### `api/activity.js`
- `getActivityFeed()` — `GET /api/activity`

---

## `src/pages/` — Page-Level Components

These are the top-level routed components — each corresponds to a route in `App.jsx`.

### `Landing.jsx` (3KB)
- Public landing page — imports and assembles landing section components
- Not role-gated

### `Login.jsx` (35KB)
- Full login page with email/password form + Google OAuth button
- Uses `AuthContext.login()` and `googleAuthUser()`
- Redirects to role dashboard on success

### `Signup.jsx` (41KB)
- Registration page — email, name, password, confirm password
- Uses `AuthContext.register()`
- After registration, redirects to `/choose-your-journey`

### `ChooseYourJourney.jsx` (6KB)
- Role selection page — user picks one of 4 roles
- Uses `AuthContext.setRole(role)` → calls `PATCH /api/auth/role`
- Redirects to `/onboarding` after role set

### `Onboarding.jsx` (9KB)
- Role-specific onboarding form (different form per role)
- Renders the appropriate `onboarding/*.jsx` component based on `user.role`
- On submit calls `AuthContext.updateProfile(data)`
- Redirects to role dashboard on completion

### `Dashboard.jsx` (65KB — largest page)
- **Seeker's main hub** — the most feature-rich page
- Sections: listing browser + filters, saved listings, area recommendations, commute calculator, cost of living estimator, AI assistant, visit scheduler, profile settings
- Reads user profile from `AuthContext`; feature-gates recommendations/commute behind Razorpay paywall
- **Key imports**: virtually all `api/*.js` modules

### `ListingDetail.jsx` (34KB)
- Individual property listing view
- Shows: images, price, amenities, ML rent prediction badge, trust/suspicious badge, commute estimate panel, enquiry form, visit scheduling, save/unsave button
- Calls `increment_view_count` on load

### `SavedListings.jsx` (319B)
- Stub page — renders saved listings (likely delegates to `Dashboard.jsx` tab or `components/`)

### `OwnerDashboard.jsx` (66KB — largest page alongside Dashboard)
- **Property owner hub**
- Sections: my listings, create/edit listing, listing analytics, visit requests from seekers, messages, profile settings, property image uploader
- Integrates Cloudinary image upload via `components/owner/PropertyImageUploader.jsx`

### `CompanyDashboard.jsx` (54KB)
- **Company HR hub**
- Sections: employee management, relocation batch creation, bulk property search for employees, budget tracker, expense management, analytics, tasks

### `AdminDashboard.jsx` (22KB)
- **Super admin platform**
- Sections: KPI cards, platform analytics, user management table, company management, property moderation panel, AI/ML monitoring, CMS editor, platform settings, feedback manager

### `AdminReviewQueue.jsx` (14KB)
- Listing moderation queue — lists all `pending_review` listings, allows approve/reject with reason

### `Profile.jsx` (23KB)
- User profile editor — role-specific profile fields, avatar, password change, account deletion

### `Inbox.jsx` (23KB)
- Full messaging inbox — conversation list + message thread view

### `CompareListings.jsx` (7KB)
- Side-by-side property comparison tool

### `VisitScheduler.jsx` (8KB)
- Visit scheduling interface — date/time picker, listing selection

### Pages that are stubs (minimal, delegating to shared components):
| Page | Size | Note |
|------|------|------|
| `Messages.jsx` | 656B | Renders shared `UniversalChatWindow` |
| `Notifications.jsx` | 604B | Renders shared `NotificationDrawer` |
| `Calendar.jsx` | 341B | Renders shared `UniversalCalendarWidget` |
| `Search.jsx` | 541B | Renders shared `GlobalSearchBar` |
| `Reports.jsx` | 2KB | Basic reports view |
| `Activity.jsx` | 319B | Renders `ActivityTimeline` |
| `Settings.jsx` | 338B | Renders `UniversalSettingsPanel` |
| `NotFound.jsx` | 1KB | 404 page |

---

## `src/components/` — Reusable Components

### `components/admin/` — Admin Panel Components

#### `AdminKPICards.jsx`
- Displays platform KPI metrics (total users, listings, revenue, etc.) in card grid

#### `AIMLMonitoringPanel.jsx`
- Shows ML model status, prediction counts, accuracy metrics

#### `ApproveRejectPanel.jsx`
- Simple approve/reject action buttons with reason input — used inside `PropertyModerationPanel`

#### `CMSContentEditor.jsx`
- Rich text editor for platform content (banners, announcements)

#### `CompanyManagementPanel.jsx`
- Admin view for all registered companies — view, approve, deactivate

#### `FeedbackManager.jsx`
- Admin view of all user feedback submissions

#### `PlatformAnalyticsPanel.jsx` (13KB)
- Detailed platform analytics charts — user growth, listing stats, conversion funnels

#### `PlatformSettingsForm.jsx`
- Form for admin to update platform settings (maintenance mode toggle, feature flags)

#### `PropertyModerationPanel.jsx` (28KB — largest component file)
- Full listing moderation interface — table of all pending listings with approve/reject/filter
- **Heavily used in `AdminDashboard.jsx`**

#### `ReviewQueueTable.jsx`
- Table component displaying review queue rows

#### `UserManagementTable.jsx` (12KB)
- Admin user management table — search, filter by role, ban/unban, change role

---

### `components/assistant/` — AI Chat Widget

#### `AssistantWidget.jsx` (9KB)
- Full chat interface for the AI assistant
- Manages message history (local state), calls `api/assistant.js`
- Shows typing indicator, renders assistant markdown responses

#### `ChatWidget.jsx` (2KB)
- Minimal floating chat button that opens `AssistantWidget`

---

### `components/auth/` — Auth Flow

#### `ChooseYourJourneyCard.jsx`
- Card UI for a single role option in the role selection screen

---

### `components/city-story/` — City Story
- **Empty** — contains only `.gitkeep`; placeholder for a future feature

---

### `components/common/` — Shared Layout & UI Primitives

#### `Badge.jsx`
- Reusable badge component with color variants (success, warning, error, neutral)

#### `Button.jsx`
- Standardized button with variants (primary, secondary, ghost, danger) and size props

#### `Card.jsx`
- Basic card wrapper with consistent padding, border, shadow

#### `Container.jsx`
- Max-width wrapper for page content

#### `ErrorComponent.jsx`
- Error display component with icon and message

#### `Footer.jsx`
- Site-wide footer with links

#### `Icons.jsx` (8KB)
- SVG icon component library — exports named icons used across the app

#### `Input.jsx`
- Controlled input with label, error state, helper text

#### `InteractiveLocationPicker.jsx` (15KB)
- Map-based location picker component — allows user to pick a point on a map
- Used in listing creation and profile setup for `work_area` / `coordinates`

#### `Layout.jsx`
- Basic layout wrapper

#### `LoadingSpinner.jsx`
- Animated loading spinner with optional message and size props

#### `MainLayout.jsx`
- Main page layout with Navbar + content slot

#### `Navbar.jsx`
- Top navigation bar — transparent on hero, solid after scroll (uses `useScrolledPastHero`)
- Shows role-appropriate nav links and user avatar

#### `PaywallBanner.jsx` (3KB)
- Displayed over locked features (recommendations, commute) — prompts Razorpay unlock

---

### `components/commute/` — Commute

#### `CommutePanel.jsx` (6KB)
- Input form for origin/destination/mode + displays commute result from `api/commute.js`
- Shows duration, distance, mode icon

---

### `components/company/` — Company HR Components

#### `AllocationGrid.jsx`
- Grid showing employee-to-property allocation status

#### `ApprovalCard.jsx` (4KB)
- HR manager approval card for relocation requests

#### `BudgetTracker.jsx`
- Progress bar + summary for relocation budget utilization

#### `BulkSearchResults.jsx`
- Results display for bulk property search (multiple employees at once)

#### `EmployeeCard.jsx` (7KB)
- Individual employee profile card with status, assignment, relocation info

#### `EnterpriseKPICards.jsx`
- Company-level KPI summary cards (employees, batches, budget, completion rate)

#### `ExpenseTable.jsx` (4KB)
- Table of relocation expenses with categorization and totals

#### `RelocationBatchForm.jsx`
- Form to create a new relocation batch with employee list + location + budget

#### `RelocationTimeline.jsx`
- Visual timeline of a relocation batch's progress stages

---

### `components/cost/` — Cost of Living

#### `CostBreakdownTable.jsx` (8KB)
- Detailed table of monthly expense categories (rent, groceries, utilities, dining, transport, entertainment) with lifestyle breakdown

---

### `components/crm/` — Broker CRM Components

#### `ActivityFeed.jsx`
- Broker activity timeline (recent actions: contact, meeting, follow-up)

#### `AnalyticsCharts.jsx` (4KB)
- Charts for broker performance (deals closed, lead conversion, revenue)

#### `ClientCard.jsx` (7KB)
- Individual client card showing status, budget, requirements, last contact

#### `CommissionWidget.jsx` (5KB)
- Commission tracker showing pending, confirmed, paid commissions

#### `PipelineBoard.jsx` (8KB)
- Kanban-style lead pipeline board (New → Contacted → Converted → Lost)

#### `TaskCard.jsx`
- Individual task card with priority, due date, status toggle

#### `VisitCalendarView.jsx` (11KB)
- Calendar grid view for broker's scheduled visits/appointments

---

### `components/dashboard/` — Dashboard Hero

#### `HubHeroCarousel.jsx` (7KB)
- Animated hero carousel at the top of `Dashboard.jsx` — cycles through feature highlights

---

### `components/enquiries/` — Enquiries

#### `EnquiryForm.jsx`
- Form to submit a property enquiry (message to owner/broker)

#### `EnquiryList.jsx`
- List of received enquiries for owner/broker view

---

### `components/hero/` — Landing Hero Animation

#### `CityHero.jsx` (16KB)
- Full-screen animated landing hero using GSAP animations
- Displays city skyline, scroll-triggered text reveals, animated statistics

#### `CityModel.jsx` (7KB)
- Three.js 3D city model component using `@react-three/fiber`
- Renders a 3D animated city scene in the landing page hero

---

### `components/listings/` — Listing Components

#### `ListingCard.jsx`
- Property listing card shown in browse grid — image, price, locality, bhk, amenities preview, save button

#### `ListingFilters.jsx`
- Filter panel for listings — locality search, deal_type, bhk, price range inputs

#### `StatusBadge.jsx`
- Displays listing status (pending_review, approved, rejected) with color

#### `TrustBadge.jsx`
- Shows ML-based trust/suspicion flag on listing cards

---

### `components/ml/` — ML Result Components

#### `RentPredictionCard.jsx`
- Shows ML rent prediction result: fair price range, confidence score, comparison to listed price

#### `TrustSignalCard.jsx`
- Shows suspicious listing detection result: is_suspicious, confidence, reason

---

### `components/onboarding/` — Role-Specific Onboarding

#### `FindAccommodationOnboarding.jsx`
- Seeker onboarding form: work_area, rent_budget, preferred_bhk, lifestyle_preference, max_commute_minutes

#### `PropertyOwnerOnboarding.jsx`
- Owner onboarding form: property_type, locality, ownership_details

#### `BrokerOnboarding.jsx`
- Broker onboarding form: license_number, specialization, areas_covered

#### `CompanyHrOnboarding.jsx`
- HR onboarding form: company_name, office_locations, relocation_budget, employee_count

---

### `components/owner/` — Owner Dashboard Components

#### `AvailabilityToggle.jsx`
- Toggle to mark a listing as available/unavailable

#### `ListingAnalytics.jsx`
- Analytics stub for individual listing performance

#### `ListingForm.jsx` (6KB)
- Full form for creating/editing a property listing — title, locality, bhk, price, deal_type, area_sqft, furnishing, amenities, description, coordinates

#### `OwnerAnalytics.jsx` (15KB)
- Comprehensive owner analytics dashboard — views, enquiries, visit requests, revenue charts per listing

#### `PropertyImageUploader.jsx` (13KB)
- Multi-image uploader using **Cloudinary** direct upload
- Drag-and-drop + click to upload
- Shows preview grid, handles upload progress, stores Cloudinary URLs

---

### `components/recommendations/` — Locality Recommendations

#### `LocalityCard.jsx` (8KB)
- Full locality info card — composite score, commute time, avg rent, amenity highlights, pros/cons

#### `DistrictScoreBar.jsx`
- Horizontal score bar for individual locality metric (residential quality, lifestyle, transport, etc.)

---

### `components/sections/` — Landing Page Sections

#### `AreaIntelligence.jsx` (9KB)
- Landing section showcasing the locality recommendation feature

#### `ChooseRole.jsx` (6KB)
- Landing section presenting the 4 role options

#### `FinalCTA.jsx` (4KB)
- Landing page bottom call-to-action section

#### `Footer.jsx` (5KB)
- Full landing page footer (different from `common/Footer.jsx` — richer with links and branding)

#### `HorizontalScrollytelling.jsx` (6KB)
- GSAP-powered horizontal scroll section on landing page

#### `HowItWorks.jsx` (10KB)
- Animated step-by-step "How MoveSmart Works" section

#### `Statistics.jsx`
- Animated number counters for platform statistics

#### `VerifiedListings.jsx` (7KB)
- Landing section showcasing verified listing cards

---

### `components/seeker/` — Seeker Components

#### `PropertyComparisonTable.jsx` (12KB)
- Side-by-side comparison table for multiple selected listings — price, bhk, area, amenities, score

---

### `components/shared/` — Cross-Role Shared Widgets

#### `ActivityTimeline.jsx`
- Timeline of recent user activity events (viewed, saved, enquired, scheduled)

#### `GlobalSearchBar.jsx` (5KB)
- Universal search input with dropdown results — searches listings, localities, users

#### `NotificationDrawer.jsx` (6KB)
- Slide-in notification panel — shows recent notifications with read/unread state

#### `UniversalCalendarWidget.jsx` (8KB)
- Calendar grid with event display — shows visits, meetings, reminders for the logged-in user

#### `UniversalChatWindow.jsx` (6KB)
- Full messaging chat UI — conversation list + message thread

#### `UniversalSettingsPanel.jsx` (4KB)
- Settings panel — profile editing, notification preferences, theme, account actions

---

### `components/ui/` — Pure UI Utilities

#### `CustomCursor.jsx`
- Custom animated cursor (teal glow) that replaces the default cursor on desktop
- Uses `mousemove` event listener

#### `PageLoader.jsx`
- Full-page loading overlay shown during route transitions

---

## `src/styles/`

### `styles/globals.css`
- Tailwind directives: `@tailwind base/components/utilities`
- **CSS custom properties** (design tokens):
  - `--color-primary: #00ADB5` (teal)
  - `--color-secondary: #393E46` (dark gray)
  - `--color-background: #EEEEEE`
  - `--color-surface: #FFFFFF`
  - `--color-text-primary: #222831` (near-black)
  - `--color-text-secondary: #393E46`
- **Fonts**: `Plus Jakarta Sans`, `Inter`, `-apple-system` fallbacks
- **Custom scrollbar** — teal gradient, dark track
- **Animations**: `fadeUp`, `fadeIn`, `auroraDrift` (animated gradient bg), `magnetic-btn-glow`
- **GSAP ScrollSmoother** layout containers: `#smooth-wrapper`, `#smooth-content`
- **SplitText** utility classes: `.split-line-wrap`, `.split-line-child`

---

## `src/utils/`

### `utils/mockData.js` (13KB)
- `LOCALITIES` — array of detailed locality objects for landing page demo
  - Each: id, name, description, overallScore, commuteScore, safetyScore, schoolsScore, costScore, greeneryScore, rentRange, pros, cons, schools, hospitals
- Used by landing page sections — this is static demo data, not from MongoDB

### `utils/razorpay.js`
- `triggerRazorpayUnlock({feature, user, onSuccess, onError})` — full Razorpay payment flow:
  1. Calls `POST /api/auth/razorpay/create-order` to get `order_id`
  2. Opens Razorpay modal with ₹30 charge for `'recommendations'` or `'commute'` feature
  3. On payment success, calls `POST /api/auth/razorpay/verify-payment` (HMAC verification)
  4. Calls `onSuccess(verifiedData)` which triggers `AuthContext.unlockFeatureInUser(feature)`
- Loads Razorpay SDK dynamically if not already present on `window`

### `utils/user.js`
- `getUserDisplayName(user)` — returns display name from `user.name`, `user.username`, `user.email` prefix, or `role_profile.name` (in priority order)

---

## Root-Level Frontend Files

### `package.json`
- App name: `movesmart-frontend`
- **Proxy**: `"proxy": "http://localhost:8000"` — all `/api` requests in dev proxy to Django
- Key dependencies:
  - `react@^18.3.1`, `react-dom`, `react-router-dom@^6.24.1`
  - `axios@^1.7.2` — HTTP client
  - `gsap@^3.15.0`, `@gsap/react@^2.1.2` — animations
  - `@react-three/fiber@^8.17.10`, `@react-three/drei@^9.121.5`, `three@^0.160.0` — 3D city model
  - `lucide-react@^0.400.0` — icon library
  - `tailwindcss@^3.4.6` — CSS framework
- Scripts: `start` / `dev` (same: react-scripts start), `build`, `test`

### `tailwind.config.js`
- Tailwind configuration — extends default theme with custom colors mapped to CSS variables, content paths set to `src/**/*.{js,jsx}`

### `.eslintrc.json`
- ESLint configuration extending `react-app` rules

### `.env`
- `REACT_APP_API_URL` — backend API base URL (defaults to proxied `/api`)

---

## How This Connects to Other Parts of the App

```
frontend/src/lib/api.js
    │  Axios instance (auth header injected)
    ▼
frontend/src/api/*.js         ← one file per backend domain
    │  HTTP calls to /api/*
    ▼
backend/apps/*/views.py       ← Django REST Framework views
    │
    ▼
MongoDB (via db/*_repo.py)

Data flow example (seeker browses listings):
  Dashboard.jsx
    → api/listings.js → GET /api/listings
    → backend/apps/listings/views.py → db/listings_repo.get_approved_listings_paginated()
    → MongoDB listings collection

Authentication flow:
  Login.jsx
    → AuthContext.login()
    → api/auth.js → POST /api/auth/login
    → access_token + refresh_token stored in localStorage
    → api.js request interceptor attaches token to all subsequent calls

Role gating:
  App.jsx ProtectedRoute → checks user.role from AuthContext
  Backend permission classes (IsOwner, IsAdmin, etc.) → independent server-side check
```

- **No Redux / Zustand** — state managed purely via React Context + useState
- **Tailwind classes** are used directly in JSX for styling (not a separate CSS file per component)
- **All API calls go through `lib/api.js`** — never use raw `fetch` or a separate axios instance
- **Feature flags**: `user.unlocked_features` array controls access to recommendations + commute calculator (Razorpay-gated for seeker role)
