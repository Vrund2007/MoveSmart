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
import PaywallBanner from '../components/common/PaywallBanner';
import HubHeroCarousel from '../components/dashboard/HubHeroCarousel';
import {
  HubIcon,
  RecommendationsIcon,
  BrowseIcon,
  BookmarkIcon,
  CompareIcon,
  CalendarIcon,
  MessageIcon,
  CostIcon,
  CommuteIcon,
  UserIcon,
  LockIcon,
  MenuIcon,
  XIcon,
  MapPinIcon,
} from '../components/common/Icons';

// Lazy-loaded page-level components for new tabs
import VisitScheduler from './VisitScheduler';
import CompareListings from './CompareListings';
import Inbox from './Inbox';
import Profile from './Profile';
import { getUserDisplayName } from '../utils/user';

const SIDEBAR_TABS = [
  { id: 'hub',             label: 'Dashboard Hub',        Icon: HubIcon             },
  { id: 'recommendations', label: 'Area Recommendations', Icon: RecommendationsIcon },
  { id: 'browse',          label: 'Browse Properties',    Icon: BrowseIcon          },
  { id: 'saved',           label: 'Saved Bookmarks',      Icon: BookmarkIcon        },
  { id: 'compare',         label: 'Compare Listings',     Icon: CompareIcon         },
  { id: 'visits',          label: 'Visit Scheduler',      Icon: CalendarIcon        },
  { id: 'inbox',           label: 'Direct Messages',      Icon: MessageIcon         },
  { id: 'cost',            label: 'Cost Estimator',       Icon: CostIcon            },
  { id: 'commute',         label: 'Commute Calculator',   Icon: CommuteIcon         },
  { id: 'profile',         label: 'My Account',           Icon: UserIcon            },
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
function QuickAction({ title, desc, onClick, badgeText }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-border rounded-2xl p-5 text-left hover:shadow-lg hover:border-primary/40 transition-all group flex flex-col justify-between gap-3 relative overflow-hidden"
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {badgeText || 'Action'}
        </span>
        <span className="text-xs font-bold text-text-secondary group-hover:text-primary transition-colors">
          →
        </span>
      </div>
      <div>
        <p className="text-sm font-extrabold text-text-primary group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { user, unlockFeatureInUser, logout } = useContext(AuthContext);
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
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
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
    const initialF = getInitialFiltersFromUrl();
    fetchApprovedListings(initialF, urlPage, false);
    fetchSavedListings();
    fetchUpcomingVisits();
  }, [urlPage]);

  useEffect(() => {
    if ((activeTab === 'recommendations' || activeTab === 'hub') && recommendations.length === 0) {
      if ((user?.unlocked_features || []).includes('recommendations')) {
        fetchRecommendations();
      }
    }
    if (activeTab === 'cost' && !costData) {
      fetchCostData();
    }
  }, [activeTab, user, recommendations.length, costData]);




  const handleToggleBookmark = async (listingId) => {
    try {
      const isSaved = savedItems.some((item) => item.listing_id === listingId || item.listing?._id === listingId);
      if (isSaved) {
        const savedItem = savedItems.find((item) => item.listing_id === listingId || item.listing?._id === listingId);
        if (savedItem) await removeSavedListing(savedItem._id);
      } else {
        await saveListing(listingId);
      }
    } catch {
      alert('Failed to update bookmark.');
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F9FAFB] font-sans text-[#222831] overflow-hidden relative">
      {/* Mobile Header Bar with 3-Lines Menu Icon on Left */}
      <div className="md:hidden bg-slate-900 text-white flex-shrink-0 z-30">
        <div className="p-3.5 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-white hover:text-teal-400 focus:outline-none transition-colors rounded-xl bg-white/10 border border-white/15 flex items-center justify-center gap-1.5 flex-shrink-0"
              aria-label="Open Mobile Navigation Menu"
            >
              <MenuIcon className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#00ADB5] to-[#222831] border border-white/20 shadow-xs flex-shrink-0">
                <img
                  src="/smart-Building.png"
                  alt="MoveSmart Logo"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <div>
                <span className="font-black text-base text-white block leading-none">MoveSmart</span>
                <span className="text-[8px] font-extrabold text-teal-400 uppercase tracking-wider block mt-0.5">ACCOMMODATION SEEKER</span>
              </div>
            </div>
          </div>

          <span className="text-[9px] font-extrabold bg-[#00ADB5]/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30 uppercase">
            Seeker
          </span>
        </div>
      </div>

      {/* Slide-Over Mobile Sidebar Drawer (Left-Aligned) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-start">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel Sliding Left-to-Right */}
          <div className="relative left-0 w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto transform transition-transform">
            <div>
              {/* Drawer Brand Header */}
              <div className="p-4 border-b border-border flex justify-between items-center bg-slate-900 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#00ADB5] to-[#222831] border border-white/20 shadow-xs flex-shrink-0">
                    <img
                      src="/smart-Building.png"
                      alt="MoveSmart Logo"
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-base tracking-tight text-white block leading-none">MoveSmart</span>
                    <span className="block text-[8px] font-extrabold text-teal-400 uppercase tracking-wider mt-0.5">SEEKER MENU</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Summary */}
              {user && (
                <div className="px-5 py-4 border-b border-border space-y-2 bg-surface">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow-sm">
                      {getUserDisplayName(user)[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-text-primary truncate">Hello, {getUserDisplayName(user)}</p>
                      <p className="text-[10px] text-text-secondary font-medium truncate">{user.email}</p>
                      <span className="text-[9px] font-extrabold text-[#00ADB5] uppercase tracking-wider block mt-0.5">Seeker Account</span>
                    </div>
                  </div>
                  <ProfileCompletion user={user} />
                </div>
              )}

              {/* Navigation Links */}
              <nav className="p-3 space-y-1">
                {SIDEBAR_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isLocked = (tab.id === 'recommendations' || tab.id === 'commute') && !(user?.unlocked_features || []).includes(tab.id);
                  let countBadge = null;
                  if (tab.id === 'saved' && savedItems.length > 0) countBadge = savedItems.length;
                  if (tab.id === 'visits' && upcomingVisits.length > 0) countBadge = upcomingVisits.length;

                  const IconComponent = tab.Icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#00ADB5] text-white shadow-md'
                          : 'text-text-primary hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {IconComponent && <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#00ADB5]'}`} />}
                        <span className="whitespace-nowrap truncate">{tab.label}</span>
                      </div>

                      {isLocked ? (
                        <span className={`p-1.5 rounded-full flex-shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          <LockIcon className="w-3.5 h-3.5" />
                        </span>
                      ) : countBadge ? (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isActive ? 'bg-white/30 text-white' : 'bg-primary/10 text-primary'
                        }`}>
                          {countBadge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Professional Logout Footer Button */}
            <div className="p-4 border-t border-border bg-surface">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all shadow-xs border border-rose-200/60"
              >
                <span>Logout Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar — Expanded w-72 for Single-Line Text, Hidden Scrollbar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-border flex-col justify-between flex-shrink-0 z-20 overflow-y-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-xs">
        <div>
          {/* Brand Header with MoveSmart Circular Logo & Gradient Border */}
          <div className="p-5 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#00ADB5] to-[#222831] border border-border shadow-xs flex-shrink-0">
              <img
                src="/smart-Building.png"
                alt="MoveSmart Logo"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831] block leading-none">MoveSmart</span>
              <span className="block text-[9px] font-extrabold text-[#00ADB5] uppercase tracking-wider mt-1">ACCOMMODATION SEEKER</span>
            </div>
          </div>

          {/* User Profile Summary */}
          {user && (
            <div className="px-5 py-4 border-b border-border space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-black text-white text-base flex-shrink-0 shadow-sm">
                  {getUserDisplayName(user)[0]?.toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-text-primary truncate">Hello, {getUserDisplayName(user)}</p>
                  <p className="text-[10px] text-text-secondary font-medium truncate">{user.email}</p>
                  <span className="text-[9px] font-extrabold text-[#00ADB5] uppercase tracking-wider block mt-0.5">Seeker Account</span>
                </div>
              </div>
              <ProfileCompletion user={user} />
            </div>
          )}

          {/* Navigation Items — Single Line Whitespace-Nowrap */}
          <nav className="p-3 space-y-1">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const isLocked = (tab.id === 'recommendations' || tab.id === 'commute') && !(user?.unlocked_features || []).includes(tab.id);
              let countBadge = null;
              if (tab.id === 'saved' && savedItems.length > 0) countBadge = savedItems.length;
              if (tab.id === 'visits' && upcomingVisits.length > 0) countBadge = upcomingVisits.length;

              const IconComponent = tab.Icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#00ADB5] text-white shadow-md'
                      : 'text-text-primary hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {IconComponent && <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#00ADB5]'}`} />}
                    <span className="whitespace-nowrap truncate">{tab.label}</span>
                  </div>

                  {isLocked ? (
                    <span className={`p-1.5 rounded-full flex-shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`} title="Locked Feature — Payment required">
                      <LockIcon className="w-3.5 h-3.5" />
                    </span>
                  ) : countBadge ? (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isActive ? 'bg-white/30 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {countBadge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — Premium Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-600 hover:text-white transition-all shadow-xs border border-rose-200/60"
          >
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F9FAFB]">
        {/* Header */}
        <header className="bg-white border-b border-border h-16 flex items-center justify-between px-6 sm:px-8 flex-shrink-0 shadow-xs">
          <h2 className="text-base font-extrabold text-[#222831]">
            {SIDEBAR_TABS.find((t) => t.id === activeTab)?.label || activeTab}
          </h2>
          <span className="text-xs font-extrabold px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-primary">
            Ahmedabad Relocation Zone
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* ── HUB TAB ─────────────────────────────────────────────── */}
          {activeTab === 'hub' && (
            <div className="space-y-8 animate-fade-in">
              {/* Automated Luxury Property Carousel */}
              <HubHeroCarousel />

              {/* Key Executive Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Saved Bookmarks', value: savedItems.length, sub: 'Favorite properties', color: 'border-l-amber-500' },
                  { label: 'Upcoming Visits', value: upcomingVisits.length, sub: 'Scheduled tours', color: 'border-l-blue-500' },
                  { label: 'Locality Ratings', value: recommendations.length, sub: 'Scored districts', color: 'border-l-primary' },
                  { label: 'Approved Properties', value: paginationMeta.total_count || listings.length, sub: 'Verified listings', color: 'border-l-emerald-500' },
                ].map((stat) => (
                  <Card key={stat.label} className={`bg-white border border-border border-l-4 ${stat.color} p-5 space-y-1 shadow-sm`}>
                    <div className="text-2xl font-black text-text-primary">{stat.value}</div>
                    <div className="text-xs font-bold text-text-primary">{stat.label}</div>
                    <p className="text-[10px] text-text-secondary font-medium">{stat.sub}</p>
                  </Card>
                ))}
              </div>

              {/* Relocation Action Matrix */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
                    Relocation Action Matrix
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <QuickAction
                    title="Browse Properties"
                    desc="Explore verified, admin-approved rental listings"
                    onClick={() => setActiveTab('browse')}
                    badgeText="Verified"
                  />
                  <QuickAction
                    title="Compare Listings"
                    desc="Side-by-side property comparison matrix"
                    onClick={() => setActiveTab('compare')}
                    badgeText="Matrix"
                  />
                  <QuickAction
                    title="Schedule Property Visit"
                    desc="Request tours with verified platform owners"
                    onClick={() => setActiveTab('visits')}
                    badgeText="Schedule"
                  />
                  <QuickAction
                    title="Direct Inbox Chat"
                    desc="Send direct messages & voice notes to landlords"
                    onClick={() => setActiveTab('inbox')}
                    badgeText="Real-time"
                  />
                </div>
              </div>

              {/* Upcoming Visits Preview */}
              {upcomingVisits.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
                      Upcoming Property Visits
                    </h3>
                    <button onClick={() => setActiveTab('visits')} className="text-xs text-primary font-bold hover:underline">
                      View All Visits →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingVisits.map((v) => (
                      <Card key={v._id} className="bg-white border border-border p-4 space-y-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-primary truncate">{v.listing?.locality || 'Property'}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            v.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>{v.status}</span>
                        </div>
                        <p className="text-xs font-bold text-text-primary truncate">{v.listing?.title || 'Property Tour'}</p>
                        <p className="text-[10px] text-text-secondary font-medium">Date: {v.scheduled_date} · {v.time_slot}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Locality Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
                      Top Recommended Localities
                    </h3>
                    <button onClick={() => setActiveTab('recommendations')} className="text-xs text-primary font-bold hover:underline">
                      View All Recommendations →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.slice(0, 3).map((item, idx) => (
                      <LocalityCard key={item.locality} item={item} rank={idx + 1} isTop={idx === 0} />
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Properties */}
              {savedItems.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
                      Saved Property Bookmarks
                    </h3>
                    <button onClick={() => setActiveTab('saved')} className="text-xs text-primary font-bold hover:underline">
                      View All Saved →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            !(user?.unlocked_features || []).includes('recommendations') ? (
              <PaywallBanner
                feature="recommendations"
                title="Area Recommendations & Locality Insights"
                description="Get weighted AI district scoring based on your rent budget, neighborhood safety rating, livability, and preferred amenities."
                user={user}
                onUnlocked={() => unlockFeatureInUser('recommendations')}
              />
            ) : (
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
            )
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
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-border shadow-xs gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#00ADB5] bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Bookmarked Listings
                    </span>
                    <span className="text-xs text-text-secondary font-extrabold bg-surface px-2.5 py-0.5 rounded-full border border-border">
                      {savedItems.length} Saved {savedItems.length === 1 ? 'Property' : 'Properties'}
                    </span>
                  </div>
                  <h3 className="font-black text-xl text-text-primary mt-1">Saved Properties Collection</h3>
                  <p className="text-xs text-text-secondary font-medium">
                    Quick access portfolio of saved homes for easy viewing and side-by-side comparison.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/dashboard?tab=browse')}
                  className="font-bold text-xs rounded-xl px-4 py-2"
                >
                  Browse More Properties
                </Button>
              </div>

              {savedLoading ? (
                <div className="py-16 text-center"><LoadingSpinner size="lg" message="Loading your saved bookmarks..." /></div>
              ) : savedItems.length === 0 ? (
                <Card className="text-center py-16 text-xs text-text-secondary bg-white border border-border rounded-2xl space-y-3 p-8">
                  <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-[#00ADB5]">
                    <BookmarkIcon className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-extrabold text-text-primary">No Saved Properties Yet</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    You haven't saved any property listings to your portfolio yet. Browse properties and click the save button to bookmark homes.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/dashboard?tab=browse')} className="font-bold text-xs rounded-xl">
                    Explore Properties
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedItems.map((item) => {
                    const listing = item.listing;
                    if (!listing) return null;
                    const isBuy = String(listing.deal_type || '').toLowerCase() === 'buy';

                    return (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between"
                      >
                        {/* Image Preview Header */}
                        <div className="h-48 w-full bg-slate-900 relative overflow-hidden">
                          <img
                            src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'}
                            alt={listing.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-xs ${
                              isBuy ? 'bg-indigo-600' : 'bg-[#00ADB5]'
                            }`}>
                              {isBuy ? 'For Sale' : 'For Rent'}
                            </span>
                          </div>
                          {listing.locality && (
                            <span className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/15">
                              <MapPinIcon className="w-3 h-3 text-teal-300" />
                              <span>{listing.locality}</span>
                            </span>
                          )}
                        </div>

                        {/* Card Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-text-primary line-clamp-1 group-hover:text-[#00ADB5] transition-colors">
                              {listing.title}
                            </h4>
                            <p className="text-base font-black text-[#00ADB5] tabular-nums">
                              ₹{listing.price?.toLocaleString()}
                              <span className="text-xs text-text-secondary font-semibold">
                                {isBuy ? '' : ' / month'}
                              </span>
                            </p>
                            <p className="text-xs text-text-secondary font-medium">
                              {listing.bhk} BHK • {listing.locality} {listing.area_sqft ? `• ${listing.area_sqft} sqft` : ''}
                            </p>
                          </div>

                          {/* Footer Action Buttons */}
                          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/listings/${listing._id}`)}
                              className="font-bold text-xs rounded-xl flex-1 py-2"
                            >
                              View Details
                            </Button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark(listing._id);
                              }}
                              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors text-xs font-bold flex items-center gap-1"
                              title="Remove from saved collection"
                            >
                              <XIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
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
            !(user?.unlocked_features || []).includes('commute') ? (
              <PaywallBanner
                feature="commute"
                title="Smart Commute Calculator & Multi-Mode Insights"
                description="Calculate exact travel times, transit costs, and route distances from your office or university to any neighborhood in Ahmedabad."
                user={user}
                onUnlocked={() => unlockFeatureInUser('commute')}
              />
            ) : (
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
                    durationMinutes={commuteData.duration_minutes}
                    distanceKm={commuteData.distance_km}
                    mode={commuteData.mode || 'driving'}
                    originLocality={commuteData.origin_locality || currentFilters.locality || 'Origin'}
                    destOffice={commuteData.destination || user?.role_profile?.work_area || 'Office'}
                  />
                ) : null}
              </div>
            )
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
