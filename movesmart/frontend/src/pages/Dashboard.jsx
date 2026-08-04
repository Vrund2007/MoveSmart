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
  const setActiveTab = (tab) => setSearchParams({ tab });

  // State
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading]           = useState(false);
  const [listings, setListings]               = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [savedItems, setSavedItems]           = useState([]);
  const [savedLoading, setSavedLoading]       = useState(false);
  const [costData, setCostData]               = useState(null);
  const [costLocality, setCostLocality]       = useState('Vastrapur');
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
        rent_budget: userProfile.max_budget || userProfile.rent_budget || 25000,
        commute_tolerance_minutes: userProfile.max_commute_minutes || userProfile.commute_tolerance_minutes || 30,
        lifestyle_pref: userProfile.lifestyle_preference || userProfile.lifestyle_pref || 'quiet'
      });
      const data = res.data || res;
      setRecommendations(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setRecLoading(false); }
  }, [user]);

  const fetchApprovedListings = useCallback(async (appliedFilters = {}) => {
    setListingsLoading(true);
    try {
      const res = await getListings(appliedFilters);
      const data = res.data || res;
      setListings(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setListingsLoading(false); }
  }, []);

  const fetchSavedListings = useCallback(async () => {
    setSavedLoading(true);
    try {
      const res = await getSavedListings();
      const data = res.data || res;
      setSavedItems(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setSavedLoading(false); }
  }, []);

  const fetchCostData = useCallback(async (loc) => {
    setCostLoading(true);
    try {
      const budget = user?.role_profile?.max_budget || user?.role_profile?.rent_budget || 25000;
      const res = await getCostEstimate(loc, budget);
      setCostData(res.data || res);
    } catch { /* ignore */ }
    finally { setCostLoading(false); }
  }, [user]);

  const fetchCommuteData = async () => {
    setCommuteLoading(true);
    setCommuteError('');
    try {
      const res = await getCommuteEstimate('Vastrapur', 'SG Highway, Ahmedabad');
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
    fetchApprovedListings();
    fetchSavedListings();
    fetchCostData('Vastrapur');
    fetchUpcomingVisits();
  }, [fetchRecommendations, fetchApprovedListings, fetchSavedListings, fetchCostData, fetchUpcomingVisits]);

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
                    <LocalityCard key={item.locality} item={item} rank={index + 1} isTop={index === 0} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BROWSE TAB ───────────────────────────────────────────── */}
          {activeTab === 'browse' && (
            <div className="space-y-6 animate-fade-in">
              <ListingFilters onFilterChange={(f) => fetchApprovedListings(f)} />
              {listingsLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Fetching approved listings..." /></div>
              ) : listings.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">No approved listings found matching your search filters.</Card>
              ) : (
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
            <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
              <Card className="flex flex-col gap-4">
                <h3 className="font-bold text-lg text-text-primary">Locality Cost Estimator</h3>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Select Locality</label>
                  <select
                    value={costLocality}
                    onChange={(e) => { setCostLocality(e.target.value); fetchCostData(e.target.value); }}
                    className="w-full bg-surface border border-border rounded p-2 text-xs text-text-primary"
                  >
                    {['Vastrapur', 'Satellite', 'Bodakdev', 'Thaltej', 'Gota', 'Navrangpura'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </Card>
              {costLoading ? (
                <div className="py-12 text-center"><LoadingSpinner size="md" message="Estimating monthly breakdown..." /></div>
              ) : costData ? (
                <CostBreakdownTable breakdown={costData.breakdown} locality={costData.locality} disclaimer={costData.disclaimer} />
              ) : null}
            </div>
          )}

          {/* ── COMMUTE TAB ──────────────────────────────────────────── */}
          {activeTab === 'commute' && (
            <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
              <Card className="flex flex-col gap-4">
                <h3 className="font-bold text-lg text-text-primary">Commute Calculator</h3>
                <p className="text-xs text-text-secondary">Calculate estimated travel duration from your target locality to office or university hubs.</p>
                <Button variant="primary" size="sm" onClick={fetchCommuteData} loading={commuteLoading}>Compute Travel Time</Button>
              </Card>
              {commuteLoading ? (
                <div className="py-12 text-center"><LoadingSpinner size="md" message="Calculating commute matrix..." /></div>
              ) : commuteError ? (
                <Card className="text-center py-6 text-xs text-warning bg-amber-50 border-amber-200">{commuteError}</Card>
              ) : commuteData ? (
                <CommutePanel durationMinutes={commuteData.duration_minutes || 25} distanceKm={commuteData.distance_km || 8.5} mode={commuteData.mode || 'driving'} />
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
