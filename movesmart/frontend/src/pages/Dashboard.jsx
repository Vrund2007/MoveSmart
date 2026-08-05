// src/pages/Dashboard.jsx — Find Accommodation Dashboard — SaaS Hub Upgrade (Phase 9)
// Extends existing dashboard with: Profile Completion, Quick Actions, Visits, Compare, Inbox, Profile, AI Workspace tabs
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAreaRecommendations } from '../api/recommendations';
import { getListings } from '../api/listings';
import { getSavedListings, saveListing, removeSavedListing } from '../api/savedListings';
import { getCostEstimate } from '../api/costOfLiving';
import { getCommuteEstimate } from '../api/commute';
import { getVisits } from '../api/visits';

import LocalityCard from '../components/recommendations/LocalityCard';
import ListingCard from '../components/listings/ListingCard';
import ListingFilters from '../components/listings/ListingFilters';
import CostBreakdownTable from '../components/cost/CostBreakdownTable';
import CommutePanel from '../components/commute/CommutePanel';
import AssistantWidget from '../components/assistant/AssistantWidget';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import InteractiveLocationPicker from '../components/common/InteractiveLocationPicker';


// Lazy-loaded page-level components for new tabs
import VisitScheduler from './VisitScheduler';
import CompareListings from './CompareListings';
import Inbox from './Inbox';
import Profile from './Profile';

const SIDEBAR_TABS = [
  { id: 'hub',             icon: '🏠', label: 'Dashboard Hub'           },
  { id: 'recommendations', icon: '⭐', label: 'Area Recommendations'    },
  { id: 'browse',          icon: '🔍', label: 'Browse Listings'         },
  { id: 'saved',           icon: '🔖', label: 'Saved Bookmarks'         },
  { id: 'compare',         icon: '⚖️', label: 'Compare Listings'        },
  { id: 'visits',          icon: '📅', label: 'Visit Scheduler'         },
  { id: 'inbox',           icon: '💬', label: 'Inbox'                   },
  { id: 'cost',            icon: '💰', label: 'Cost Estimator'          },
  { id: 'commute',         icon: '🚗', label: 'Commute Calculator'      },
  { id: 'profile',         icon: '👤', label: 'My Profile'              },
];

// ── Profile Completion Helper ──────────────────────────────────────────────
function ProfileCompletion({ user }) {
  const fields = [
    !!user?.email,
    !!user?.role_profile?.max_budget,
    !!user?.role_profile?.preferred_bhk,
    !!(user?.role_profile?.preferred_localities?.length > 0),
    !!user?.role_profile?.lifestyle_preference,
    !!user?.role_profile?.work_area,
    !!user?.role_profile?.commute_mode,
  ];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary font-medium">Profile Completion</span>
        <span className="text-primary font-extrabold">{pct}%</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Quick Action Card ──────────────────────────────────────────────────────
function QuickAction({ icon, label, desc, onClick, color = 'bg-primary/10 text-primary' }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-border rounded-xl p-4 text-left hover:shadow-md hover:border-primary/40 transition-all group flex flex-col gap-2"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">{label}</p>
        <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
      </div>

    </button>
  );
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'hub';
  const urlPage = parseInt(searchParams.get('page') || sessionStorage.getItem('last_browse_page') || '1', 10);

  const setActiveTab = (tab) => {
    const params = { tab };
    if (tab === 'browse') {
      const pageToUse = sessionStorage.getItem('last_browse_page') || '1';
      params.page = pageToUse;
    }
    setSearchParams(params);
  };

  const getInitialFiltersFromUrl = useCallback(() => {
    let savedSession = {};
    try {
      savedSession = JSON.parse(sessionStorage.getItem('active_browse_filters') || '{}');
    } catch {
      savedSession = {};
    }

    const locality = searchParams.get('locality') ?? savedSession.locality ?? '';
    const bhk = searchParams.get('bhk') ?? savedSession.bhk ?? '';
    const deal_type = searchParams.get('deal_type') ?? savedSession.deal_type ?? '';
    const max_price = searchParams.get('max_price') ?? savedSession.max_price ?? '';

    const filters = {};
    if (locality) filters.locality = locality;
    if (bhk) filters.bhk = bhk;
    if (deal_type && deal_type !== 'all') filters.deal_type = deal_type;
    if (max_price) filters.max_price = max_price;
    return filters;
  }, [searchParams]);


  // State
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading]           = useState(false);
  const [listings, setListings]               = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [paginationMeta, setPaginationMeta]   = useState({ page: urlPage, total_pages: 1, total_count: 0, has_next: false });
  const [currentFilters, setCurrentFilters]   = useState(getInitialFiltersFromUrl);
  const [savedItems, setSavedItems]           = useState([]);
  const [savedLoading, setSavedLoading]       = useState(false);
  const [costData, setCostData]               = useState(null);
  const [costFilters, setCostFilters]         = useState({
    locality: 'Navrangpura',
    bhk: 2,
    householdType: 'bachelor',
    lifestyle: 'balanced',
    commuteMode: 'bike'
  });
  const [costLoading, setCostLoading]         = useState(false);
  const [commuteData, setCommuteData]         = useState(null);
  const [commuteError, setCommuteError]       = useState('');
  const [commuteLoading, setCommuteLoading]   = useState(false);
  const [upcomingVisits, setUpcomingVisits]   = useState([]);

  // Data Fetchers
  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    try {
      const userProfile = user?.role_profile || {};
      const res = await getAreaRecommendations({
        max_budget: userProfile.max_budget || userProfile.rent_budget || 25000,
        rent_budget: userProfile.max_budget || userProfile.rent_budget || 25000,
        max_commute_minutes: userProfile.max_commute_minutes || userProfile.commute_tolerance_minutes || 30,
        commute_tolerance_minutes: userProfile.max_commute_minutes || userProfile.commute_tolerance_minutes || 30,
        lifestyle_preference: userProfile.lifestyle_preference || userProfile.lifestyle_pref || 'quiet',
        lifestyle_pref: userProfile.lifestyle_preference || userProfile.lifestyle_pref || 'quiet',
        preferred_localities: userProfile.preferred_localities || []
      });
      const data = res.data || res;
      setRecommendations(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setRecLoading(false); }
  }, [user]);

  const fetchApprovedListings = useCallback(async (filters, pageNum, append = false) => {
    const activeFilters = filters !== undefined ? filters : currentFilters;
    const targetPage = pageNum || urlPage || 1;

    setListingsLoading(true);
    try {
      const res = await getListings({ ...activeFilters, page: targetPage, page_size: 24 });
      const data = res.data || res;
      const meta = res.meta || { page: targetPage, total_pages: 1, total_count: Array.isArray(data) ? data.length : 0, has_next: false };
      
      const newItems = Array.isArray(data) ? data : [];
      setListings((prev) => (append ? [...prev, ...newItems] : newItems));
      setPaginationMeta(meta);
      setCurrentFilters(activeFilters);

      // Persist active page & filters in sessionStorage & URL searchParams
      sessionStorage.setItem('last_browse_page', targetPage.toString());
      sessionStorage.setItem('active_browse_filters', JSON.stringify(activeFilters));
      
      if (activeTab === 'browse') {
        const cleanParams = { tab: 'browse', page: targetPage.toString() };
        if (activeFilters.locality) cleanParams.locality = activeFilters.locality;
        if (activeFilters.bhk) cleanParams.bhk = activeFilters.bhk;
        if (activeFilters.deal_type) cleanParams.deal_type = activeFilters.deal_type;
        if (activeFilters.max_price) cleanParams.max_price = activeFilters.max_price;
        setSearchParams(cleanParams);
      }

      // Background pre-fetch next page silently while user watches current page
      if (meta.has_next) {
        setTimeout(() => {
          getListings({ ...activeFilters, page: targetPage + 1, page_size: 24 }).catch(() => {});
        }, 1200);
      }
    } catch { /* ignore */ }
    finally { setListingsLoading(false); }
  }, [urlPage, activeTab, setSearchParams, currentFilters]);

  const handleSelectLocalityFromCard = useCallback((localityName) => {
    const newFilters = { ...currentFilters, locality: localityName };
    setCurrentFilters(newFilters);
    setActiveTab('browse');
    fetchApprovedListings(newFilters, 1, false);
    setSearchParams({ tab: 'browse', locality: localityName, page: '1' });
  }, [currentFilters, fetchApprovedListings, setSearchParams]);


  const fetchSavedListings = useCallback(async () => {
    setSavedLoading(true);
    try {
      const res = await getSavedListings();
      const data = res.data || res;
      setSavedItems(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setSavedLoading(false); }
  }, []);

  const fetchCostData = useCallback(async (overrides = {}) => {
    setCostLoading(true);
    try {
      const active = typeof overrides === 'string' ? { ...costFilters, locality: overrides } : { ...costFilters, ...overrides };
      const budget = user?.role_profile?.max_budget || user?.role_profile?.rent_budget || 0;
      const res = await getCostEstimate(
        active.locality,
        budget,
        active.bhk,
        active.householdType,
        active.lifestyle,
        active.commuteMode
      );
      setCostData(res.data || res);
    } catch { /* ignore */ }
    finally { setCostLoading(false); }
  }, [user, costFilters]);


  const fetchCommuteData = async () => {
    setCommuteLoading(true);
    setCommuteError('');
    try {
      const originLocality = currentFilters.locality || user?.role_profile?.preferred_localities?.[0] || 'Bodakdev';
      const destOffice = user?.role_profile?.work_area || 'Navrangpura, Ahmedabad';
      const commuteMode = (user?.role_profile?.commute_mode || 'Car').toLowerCase();

      const res = await getCommuteEstimate(originLocality, destOffice, commuteMode);
      setCommuteData(res.data || res);
    } catch {
      setCommuteError('Commute data temporarily unavailable.');
    } finally { setCommuteLoading(false); }
  };


  const fetchUpcomingVisits = useCallback(async () => {
    try {
      const res = await getVisits();
      const data = res.data || res;
      const list = Array.isArray(data) ? data : [];
      setUpcomingVisits(list.filter((v) => v.status === 'requested' || v.status === 'confirmed').slice(0, 3));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchRecommendations();
    const initialF = getInitialFiltersFromUrl();
    fetchApprovedListings(initialF, urlPage, false);
    fetchSavedListings();
    fetchCostData();
    fetchUpcomingVisits();
  }, [urlPage]);




  const handleToggleBookmark = async (listingId) => {
    try {
      const isSaved = savedItems.some((item) => item.listing_id === listingId || item.listing?._id === listingId);
      if (isSaved) {
        const savedItem = savedItems.find((item) => item.listing_id === listingId || item.listing?._id === listingId);
        if (savedItem) await removeSavedListing(savedItem._id);
      } else {
        await saveListing(listingId);
      }
      fetchSavedListings();
    } catch {
      alert('Failed to update bookmark.');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20 overflow-y-auto">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl">🏠</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Accommodation Seeker</span>
            </div>
          </div>

          {/* User Summary */}
          {user && (
            <div className="px-4 py-3 border-b border-[#D9D9D9] space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-text-primary truncate">{user.email}</p>
                  <p className="text-[9px] text-text-secondary">Seeker</p>
                </div>
              </div>
              <ProfileCompletion user={user} />
            </div>
          )}

          {/* Navigation */}
          <nav className="p-3 space-y-0.5">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              let badge = null;
              if (tab.id === 'saved') badge = savedItems.length;
              if (tab.id === 'visits') badge = upcomingVisits.length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white shadow-sm' : 'text-[#393E46] hover:bg-[#EEEEEE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {badge > 0 && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/30 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: Logout */}
        <div className="p-4 border-t border-[#D9D9D9]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-base font-bold text-[#222831] capitalize">
            {SIDEBAR_TABS.find((t) => t.id === activeTab)?.label || activeTab}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEEEEE] border border-[#D9D9D9] rounded-full text-[#393E46]">
            Ahmedabad Region
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">

          {/* ── HUB TAB ─────────────────────────────────────────────── */}
          {activeTab === 'hub' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#00ADB5] to-teal-600 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white shadow-lg">
                <div>
                  <h3 className="text-xl font-extrabold">Welcome back, {user?.email?.split('@')[0] || 'Seeker'} 👋</h3>
                  <p className="text-sm opacity-90 mt-1">Your smart relocation hub — powered by rule-based recommendations and AI insights.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('browse')} className="bg-white text-primary font-bold border-0">
                  Browse Properties →
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Saved Properties', value: savedItems.length, icon: '🔖', color: 'text-amber-600' },
                  { label: 'Upcoming Visits', value: upcomingVisits.length, icon: '📅', color: 'text-blue-600' },
                  { label: 'Area Scores', value: recommendations.length, icon: '⭐', color: 'text-primary' },
                  { label: 'Active Listings', value: listings.length, icon: '🏘️', color: 'text-teal-600' },
                ].map((stat) => (
                  <Card key={stat.label} className="bg-white border border-border text-center py-4">
                    <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-text-secondary font-bold mt-1 flex items-center justify-center gap-1">
                      <span>{stat.icon}</span><span>{stat.label}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickAction icon="🔍" label="Browse Properties" desc="Explore verified, admin-approved listings" onClick={() => setActiveTab('browse')} color="bg-primary/10 text-primary" />
                  <QuickAction icon="⚖️" label="Compare Listings" desc="Side-by-side property comparison matrix" onClick={() => setActiveTab('compare')} color="bg-teal-100 text-teal-700" />
                  <QuickAction icon="📅" label="Schedule Visit" desc="Request property tours with owners" onClick={() => setActiveTab('visits')} color="bg-blue-100 text-blue-700" />
                  <QuickAction icon="🤖" label="AI Relocation Guide" desc="Ask Gemini your relocation questions" onClick={() => {}} color="bg-purple-100 text-purple-700" />
                </div>
              </div>

              {/* Upcoming Visits Preview */}
              {upcomingVisits.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Upcoming Visits</h3>
                    <button onClick={() => setActiveTab('visits')} className="text-xs text-primary font-bold hover:underline">View all →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingVisits.map((v) => (
                      <Card key={v._id} className="bg-white border border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-primary truncate">{v.listing?.locality || 'Property'}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            v.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{v.status}</span>
                        </div>
                        <p className="text-xs font-semibold text-text-primary truncate">{v.listing?.title || 'Property Visit'}</p>
                        <p className="text-[10px] text-text-secondary">📅 {v.scheduled_date} · {v.time_slot}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Recommended Areas Preview */}
              {recommendations.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Top Recommended Localities</h3>
                    <button onClick={() => setActiveTab('recommendations')} className="text-xs text-primary font-bold hover:underline">View full scores →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.slice(0, 3).map((item, idx) => (
                      <LocalityCard key={item.locality} item={item} rank={idx + 1} isTop={idx === 0} />
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Properties Preview */}
              {savedItems.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Saved Properties</h3>
                    <button onClick={() => setActiveTab('saved')} className="text-xs text-primary font-bold hover:underline">View all →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {savedItems.slice(0, 3).map((item) => {
                      const listing = item.listing;
                      if (!listing) return null;
                      return (
                        <ListingCard
                          key={item._id}
                          listing={listing}
                          onClick={() => navigate(`/listings/${listing._id}`)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── RECOMMENDATIONS TAB ──────────────────────────────────── */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6 animate-fade-in">
              <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border-primary">
                <div>
                  <h3 className="font-bold text-lg text-text-primary">Locality Recommendation Engine</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Weighted district scoring based on your rent budget (₹{(user?.role_profile?.max_budget || user?.role_profile?.rent_budget || 25000).toLocaleString()}) and commute preferences.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={fetchRecommendations} loading={recLoading} className="mt-3 sm:mt-0">
                  Re-score Localities
                </Button>
              </Card>

              {recLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Calculating weighted district recommendation scores..." /></div>
              ) : recommendations.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">
                  No recommendation scores returned. Complete your onboarding profile to calculate scores.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((item, index) => (
                    <LocalityCard
                      key={item.locality}
                      item={item}
                      rank={index + 1}
                      isTop={index === 0}
                      onSelectLocality={handleSelectLocalityFromCard}
                    />
                  ))}
                </div>

              )}
            </div>
          )}

          {/* ── BROWSE TAB ───────────────────────────────────────────── */}
          {activeTab === 'browse' && (
            <div className="space-y-6 animate-fade-in">
              <ListingFilters initialFilters={currentFilters} onFilterChange={(f) => fetchApprovedListings(f, 1, false)} />

              
              {/* Pagination Status Bar */}
              <div className="flex justify-between items-center text-xs text-text-secondary px-1">
                <span>
                  Showing <strong className="text-text-primary">{listings.length}</strong> of{' '}
                  <strong className="text-primary">{paginationMeta.total_count || listings.length}</strong> properties
                </span>
                {paginationMeta.total_pages > 1 && (
                  <span className="font-semibold text-text-primary">
                    Page {paginationMeta.page} of {paginationMeta.total_pages}
                  </span>
                )}
              </div>

              {listingsLoading && listings.length === 0 ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Fetching approved listings..." /></div>
              ) : listings.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">No approved listings found matching your search filters.</Card>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => {
                      const isSaved = savedItems.some((s) => s.listing_id === listing._id || s.listing?._id === listing._id);
                      return (
                        <div key={listing._id} className="relative group">
                          <ListingCard listing={listing} onClick={() => navigate(`/listings/${listing._id}`)} />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleBookmark(listing._id); }}
                            className={`absolute top-3 right-3 p-2 rounded-full border text-xs shadow-sm transition-all ${
                              isSaved ? 'bg-amber-100 text-warning border-amber-300 font-bold' : 'bg-white text-text-secondary border-border hover:border-primary'
                            }`}
                          >
                            {isSaved ? '★ Saved' : '☆ Save'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls & Load More */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!paginationMeta.has_prev || listingsLoading}
                        onClick={() => fetchApprovedListings(currentFilters, paginationMeta.page - 1, false)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                      >
                        ← Previous Page
                      </button>
                      <span className="text-xs font-bold text-text-secondary px-2">
                        Page {paginationMeta.page} / {paginationMeta.total_pages}
                      </span>
                      <button
                        disabled={!paginationMeta.has_next || listingsLoading}
                        onClick={() => fetchApprovedListings(currentFilters, paginationMeta.page + 1, false)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                      >
                        Next Page →
                      </button>
                    </div>

                    {paginationMeta.has_next && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={listingsLoading}
                        onClick={() => fetchApprovedListings(currentFilters, paginationMeta.page + 1, true)}
                        className="text-xs font-bold px-6 py-2"
                      >
                        Load More Properties (+24)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ── SAVED TAB ────────────────────────────────────────────── */}
          {activeTab === 'saved' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-text-primary">Saved Properties Collection</h3>
                <span className="text-xs text-text-secondary font-bold">{savedItems.length} saved</span>
              </div>
              {savedLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Loading your bookmarks..." /></div>
              ) : savedItems.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">
                  You haven't bookmarked any properties yet. Use the Browse tab to save listings.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedItems.map((item) => {
                    const listing = item.listing;
                    if (!listing) return null;
                    return (
                      <div key={item._id} className="relative">
                        <ListingCard listing={listing} onClick={() => navigate(`/listings/${listing._id}`)} />
                        <Button variant="danger" size="sm" className="mt-2 w-full text-xs" onClick={() => handleToggleBookmark(listing._id)}>
                          Remove Bookmark
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COMPARE TAB ──────────────────────────────────────────── */}
          {activeTab === 'compare' && <CompareListings />}

          {/* ── VISITS TAB ───────────────────────────────────────────── */}
          {activeTab === 'visits' && <VisitScheduler />}

          {/* ── INBOX TAB ────────────────────────────────────────────── */}
          {activeTab === 'inbox' && <Inbox />}

          {/* ── COST TAB ─────────────────────────────────────────────── */}
          {activeTab === 'cost' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <Card className="space-y-4 bg-white border border-border">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">💡 Locality Cost-of-Living Intelligence</h3>
                    <p className="text-xs text-text-secondary">Data-driven monthly expenditure model integrating real MongoDB market listings, utilities, food, and commute costs.</p>
                  </div>
                </div>

                {/* Filter Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {/* 1. Locality Select (43+ Localities) */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="text-xs font-bold text-text-primary mb-1 block">Select Locality / Neighborhood</label>
                    <select
                      value={costFilters.locality}
                      onChange={(e) => {
                        const updated = { ...costFilters, locality: e.target.value };
                        setCostFilters(updated);
                        fetchCostData(updated);
                      }}
                      className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary outline-none focus:border-primary font-medium"
                    >
                      <optgroup label="Central Ahmedabad">
                        {['Navrangpura', 'Paldi', 'Ellisbridge', 'Naranpura', 'Memnagar', 'Shahibaug'].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </optgroup>
                      <optgroup label="West Ahmedabad & Prime Corridors">
                        {['Bodakdev', 'Satellite', 'Vastrapur', 'Thaltej', 'Prahladnagar', 'Ambli', 'Vejalpur', 'Science City', 'Sindhu Bhavan'].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </optgroup>
                      <optgroup label="North Ahmedabad & SG Highway">
                        {['Gota', 'Chandkheda', 'Motera', 'Ghatlodia', 'Ranip'].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Suburbs & Bopal Corridors">
                        {['Bopal', 'South Bopal', 'Shela', 'Shilaj'].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </optgroup>
                      <optgroup label="South & East Ahmedabad">
                        {['Maninagar'].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Gandhinagar & Tech Hubs">
                        {['Infocity', 'GIFT City', 'Sargasan', 'Kudasan', 'Raysan', 'Sector 1-30 Gandhinagar'].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* 2. BHK Size */}
                  <div>
                    <label className="text-[11px] font-bold text-text-primary mb-1 block">BHK Size</label>
                    <select
                      value={costFilters.bhk}
                      onChange={(e) => {
                        const updated = { ...costFilters, bhk: Number(e.target.value) };
                        setCostFilters(updated);
                        fetchCostData(updated);
                      }}
                      className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-primary outline-none focus:border-primary"
                    >
                      <option value={1}>1 BHK</option>
                      <option value={2}>2 BHK</option>
                      <option value={3}>3 BHK</option>
                      <option value={4}>4 BHK</option>
                    </select>
                  </div>

                  {/* 3. Household Type */}
                  <div>
                    <label className="text-[11px] font-bold text-text-primary mb-1 block">Household Size</label>
                    <select
                      value={costFilters.householdType}
                      onChange={(e) => {
                        const updated = { ...costFilters, householdType: e.target.value };
                        setCostFilters(updated);
                        fetchCostData(updated);
                      }}
                      className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-primary outline-none focus:border-primary"
                    >
                      <option value="bachelor">🧑 Single / Bachelor</option>
                      <option value="couple">💑 Couple / Working Pair</option>
                      <option value="family">👨‍👩‍👧‍👦 Family (3-4 members)</option>
                    </select>
                  </div>

                  {/* 4. Lifestyle Tier */}
                  <div>
                    <label className="text-[11px] font-bold text-text-primary mb-1 block">Lifestyle Preference</label>
                    <select
                      value={costFilters.lifestyle}
                      onChange={(e) => {
                        const updated = { ...costFilters, lifestyle: e.target.value };
                        setCostFilters(updated);
                        fetchCostData(updated);
                      }}
                      className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-primary outline-none focus:border-primary"
                    >
                      <option value="budget">🪙 Budget / Minimalist</option>
                      <option value="balanced">⚖️ Standard / Balanced</option>
                      <option value="premium">👑 Premium / Luxury</option>
                    </select>
                  </div>
                </div>
              </Card>

              {costLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Computing data-driven cost-of-living model..." />
                </div>
              ) : costData ? (
                <CostBreakdownTable
                  breakdown={costData.breakdown}
                  locality={costData.locality}
                  bhk={costData.bhk || costFilters.bhk}
                  householdType={costData.household_type || costFilters.householdType}
                  lifestyle={costData.lifestyle || costFilters.lifestyle}
                  commuteMode={costData.commute_mode || costFilters.commuteMode}
                  marketStats={costData.real_market_stats}
                  totalMonthly={costData.estimated_total_monthly}
                  costIndexPct={costData.cost_index_pct}
                  insights={costData.insights}
                  disclaimer={costData.disclaimer}
                />
              ) : null}
            </div>
          )}


          {/* ── COMMUTE TAB ──────────────────────────────────────────── */}
          {activeTab === 'commute' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <Card className="space-y-4 bg-white border border-border">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">🚗 Premium Commute Intelligence Matrix</h3>
                    <p className="text-xs text-text-secondary">Calculate real-time travel durations, distances, and monthly transit costs from any origin to your office.</p>
                  </div>
                </div>

                {/* Saved Office Destination Validation Status */}
                {user?.role_profile?.work_area ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">📍 Saved Destination Office</span>
                      <span className="font-bold text-emerald-950 text-xs">{user.role_profile.work_area}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Edit Office Location →
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex justify-between items-center text-xs text-amber-900">
                    <div>
                      <span className="font-extrabold block text-sm">⚠️ No Office Location Saved in Profile</span>
                      <span className="text-xs text-amber-800">Please set your office location in your profile first to compute accurate commute matrices.</span>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setActiveTab('profile')}>
                      Go to Profile Settings →
                    </Button>
                  </div>
                )}

                {/* Interactive Origin Location Selector */}
                <div className="pt-2">
                  <InteractiveLocationPicker
                    label="Select Starting Origin Location (Apartment / Neighborhood / Pin 📍)"
                    value={currentFilters.locality || user?.role_profile?.preferred_localities?.[0] || 'Bodakdev, Ahmedabad'}
                    showSaveButton={false}
                    onChange={(selectedLoc) => {
                      setCurrentFilters({ ...currentFilters, locality: selectedLoc });
                    }}
                  />
                </div>


                <Button
                  variant="primary"
                  size="md"
                  onClick={fetchCommuteData}
                  loading={commuteLoading}
                  className="w-full font-bold shadow-md"
                >
                  🚀 Compute Travel Matrix & Multi-Mode Insights
                </Button>
              </Card>

              {commuteLoading ? (
                <div className="py-12 text-center"><LoadingSpinner size="lg" message="Calculating Geoapify multi-mode commute matrix..." /></div>
              ) : commuteError ? (
                <Card className="text-center py-6 text-xs text-warning bg-amber-50 border-amber-200">{commuteError}</Card>
              ) : commuteData ? (
                <CommutePanel
                  durationMinutes={commuteData.duration_minutes || 20}
                  distanceKm={commuteData.distance_km || 7.5}
                  mode={commuteData.mode || 'driving'}
                  originLocality={commuteData.origin_locality || currentFilters.locality || 'Bodakdev'}
                  destOffice={commuteData.destination || user?.role_profile?.work_area || 'Navrangpura'}
                />
              ) : null}
            </div>
          )}


          {/* ── PROFILE TAB ──────────────────────────────────────────── */}
          {activeTab === 'profile' && <Profile />}

        </div>
      </main>

      {/* Floating Gemini AI Assistant */}
      <AssistantWidget />
    </div>
  );
}
