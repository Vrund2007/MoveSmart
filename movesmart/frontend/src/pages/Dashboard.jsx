// src/pages/Dashboard.jsx
// Premium responsive React + Tailwind CSS dashboard for MoveSmart Buyers & Renters.
// Light Theme, rounded cards, smooth micro-interactions, Lucide-like custom SVG icons.

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProfileContext } from '../context/ProfileContext';
import { LOCALITIES, LISTINGS, COST_OF_LIVING, MOCK_NOTIFICATIONS, COMMUTE_DATA } from '../utils/mockData';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { profile, updateProfile } = useContext(ProfileContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab selection
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Checked properties for side-by-side comparison
  const [comparedIds, setComparedIds] = useState(['lst-1', 'lst-3']);
  
  // Selected property for detail view tab
  const [selectedPropId, setSelectedPropId] = useState('lst-1');

  // Favorites tracking
  const [favorites, setFavorites] = useState(['lst-1', 'lst-5']);

  // Redirect to onboarding if not done
  useEffect(() => {
    const onboarded = localStorage.getItem('movesmart_onboarding_completed');
    if (!onboarded && (!user || user.role === 'find_accommodation')) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#FFFFFF] border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Logo">🏠</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Buyer & Renter Workspace</span>
            </div>
          </div>

          {/* User role summary */}
          <div className="p-4 mx-4 my-4 bg-[#EEEEEE] rounded-lg border border-[#D9D9D9]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#00ADB5] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                👤
              </div>
              <div className="overflow-hidden">
                <span className="block font-bold text-xs text-[#222831] truncate">{user?.email || 'seeker@movesmart.com'}</span>
                <span className="block text-[9px] font-bold text-[#393E46] uppercase">Active Relocator</span>
              </div>
            </div>
          </div>

          {/* Menu links */}
          <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {[
              { id: 'overview', label: 'Dashboard Hub', icon: '📊' },
              { id: 'search', label: 'Search Property', icon: '🔍' },
              { id: 'detail', label: 'Property Details', icon: '🏠' },
              { id: 'saved', label: 'Saved Properties', icon: '⭐', count: favorites.length },
              { id: 'compare', label: 'Compare Listings', icon: '⚖️', count: comparedIds.length },
              { id: 'scheduler', label: 'Visit Scheduler', icon: '📅' },
              { id: 'chat', label: 'Inbox Messages', icon: '💬' },
              { id: 'assistant', label: 'AI Relocation Assist', icon: '🤖' },
              { id: 'profile', label: 'My Profile', icon: '👤' }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#00ADB5] text-white'
                      : 'text-[#393E46] hover:bg-[#EEEEEE] hover:text-[#222831]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 py-1">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-[#00ADB5]' : 'bg-[#393E46] text-white'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer logout */}
        <div className="p-4 border-t border-[#D9D9D9]">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-[#222831] capitalize">
            {activeTab.replace('-', ' ')} View
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEEEEE] border border-[#D9D9D9] rounded-full text-[#393E46] uppercase">
              Ahmedabad Hub
            </span>
          </div>
        </header>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {activeTab === 'overview' && (
            <OverviewTab 
              setActiveTab={setActiveTab} 
              favorites={favorites} 
              setSelectedPropId={setSelectedPropId}
            />
          )}
          {activeTab === 'search' && (
            <SearchTab 
              favorites={favorites} 
              setFavorites={setFavorites}
              comparedIds={comparedIds} 
              setComparedIds={setComparedIds}
              setSelectedPropId={setSelectedPropId}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'detail' && (
            <DetailTab 
              propId={selectedPropId} 
              setSelectedPropId={setSelectedPropId}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          )}
          {activeTab === 'saved' && (
            <SavedTab 
              favorites={favorites} 
              setFavorites={setFavorites}
              setSelectedPropId={setSelectedPropId}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'compare' && (
            <CompareTab 
              comparedIds={comparedIds} 
              setComparedIds={setComparedIds} 
              setSelectedPropId={setSelectedPropId}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'scheduler' && <SchedulerTab />}
          {activeTab === 'chat' && <ChatTab />}
          {activeTab === 'assistant' && <AssistantTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Overview Dashboard
───────────────────────────────────────────────────────────── */
function OverviewTab({ setActiveTab, favorites, setSelectedPropId }) {
  const { profile } = useContext(ProfileContext);

  // Mock visits
  const upcomingVisits = [
    { id: 'v-1', property: 'Modern 3 BHK in Vastrapur Heights', broker: 'Amit Trivedi', date: '2026-08-05', time: '11:00 AM' },
    { id: 'v-2', property: 'Luxury 4 BHK Penthouse at Bodakdev Vista', broker: 'Rohan Shah', date: '2026-08-07', time: '04:30 PM' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-[#222831]">Welcome back, Seeker</h2>
          <p className="text-xs text-[#393E46] mt-1 leading-relaxed">
            Your relocation parameters are saved. Budget: <strong>₹{profile?.rent_budget?.toLocaleString('en-IN')}/mo</strong>.
            Target office commute: <strong>{profile?.commute_tolerance} min</strong> to {profile?.work_location}.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('search')}
          className="mt-4 md:mt-0 bg-[#00ADB5] hover:bg-[#008C93] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
        >
          🔍 Search Properties
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget summary */}
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#393E46] uppercase">Monthly Budget Target</span>
            <div className="text-3xl font-extrabold text-[#222831] mt-1 tabular-nums">
              ₹{profile?.rent_budget?.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-[#393E46] mt-2 leading-relaxed">
              Based on your monthly allocation, we have matched 6 candidate properties in Ahmedabad.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-full mt-4 border border-[#D9D9D9] hover:border-[#393E46] py-2 rounded-lg text-[10px] font-bold text-[#222831] bg-white transition-colors"
          >
            Adjust Budget Slider
          </button>
        </div>

        {/* Saved property teaser */}
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#393E46] uppercase">Saved properties</span>
            <div className="text-3xl font-extrabold text-[#00ADB5] mt-1 tabular-nums">
              {favorites.length} Listings
            </div>
            <p className="text-[10px] text-[#393E46] mt-2 leading-relaxed">
              Keep track of listings you love. Compare specs or request site tours in one click.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('saved')}
            className="w-full mt-4 border border-[#D9D9D9] hover:border-[#393E46] py-2 rounded-lg text-[10px] font-bold text-[#222831] bg-white transition-colors"
          >
            View Saved Items
          </button>
        </div>

        {/* Upcoming visits */}
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#393E46] uppercase">Upcoming Site Visits</span>
            <div className="text-3xl font-extrabold text-[#22C55E] mt-1 tabular-nums">
              {upcomingVisits.length} Booked
            </div>
            <p className="text-[10px] text-[#393E46] mt-2 leading-relaxed">
              Verify listings visually in person. Next visit scheduled for tomorrow at 11:00 AM.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('scheduler')}
            className="w-full mt-4 border border-[#D9D9D9] hover:border-[#393E46] py-2 rounded-lg text-[10px] font-bold text-[#222831] bg-white transition-colors"
          >
            View Visit Calendar
          </button>
        </div>
      </div>

      {/* Grid: Recommended & Recently Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended properties */}
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl space-y-4">
          <h3 className="font-bold text-sm text-[#222831]">Recommended Properties</h3>
          <div className="space-y-3">
            {LISTINGS.slice(0, 3).map((p) => (
              <div 
                key={p.id}
                onClick={() => { setSelectedPropId(p.id); setActiveTab('detail'); }}
                className="flex items-center space-x-3 border-b border-[#EEEEEE] pb-3 cursor-pointer group"
              >
                <div className="w-12 h-10 bg-[#EEEEEE] rounded-lg overflow-hidden flex-shrink-0">
                  <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs text-[#222831] truncate group-hover:text-[#00ADB5] transition-colors">{p.title}</strong>
                  <span className="block text-[10px] text-[#393E46]">{p.bhk} BHK • {p.locality}</span>
                </div>
                <span className="text-xs font-bold text-[#222831] tabular-nums">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently viewed properties */}
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl space-y-4">
          <h3 className="font-bold text-sm text-[#222831]">Recently Viewed</h3>
          <div className="space-y-3">
            {LISTINGS.slice(3, 6).map((p) => (
              <div 
                key={p.id}
                onClick={() => { setSelectedPropId(p.id); setActiveTab('detail'); }}
                className="flex items-center space-x-3 border-b border-[#EEEEEE] pb-3 cursor-pointer group"
              >
                <div className="w-12 h-10 bg-[#EEEEEE] rounded-lg overflow-hidden flex-shrink-0">
                  <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs text-[#222831] truncate group-hover:text-[#00ADB5] transition-colors">{p.title}</strong>
                  <span className="block text-[10px] text-[#393E46]">{p.bhk} BHK • {p.locality}</span>
                </div>
                <span className="text-xs font-bold text-[#222831] tabular-nums">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Search & Listings
───────────────────────────────────────────────────────────── */
function SearchTab({ favorites, setFavorites, comparedIds, setComparedIds, setSelectedPropId, setActiveTab }) {
  const { profile } = useContext(ProfileContext);

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [bhkFilter, setBhkFilter] = useState('all');
  const [priceMax, setPriceMax] = useState(profile?.rent_budget || 50000);
  const [furnishing, setFurnishing] = useState('all');
  const [readyToMove, setReadyToMove] = useState(false);

  // Filter listings
  const filteredListings = LISTINGS.filter((p) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.locality.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (bhkFilter !== 'all' && p.bhk !== Number(bhkFilter)) return false;
    if (p.price > priceMax) return false;
    if (readyToMove && p.isSuspicious) return false; // simulated ready filter
    return true;
  });

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  const toggleCompare = (id, e) => {
    e.stopPropagation();
    setComparedIds((prev) => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and filter header */}
      <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by area or property title (e.g. Vastrapur)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-[#D9D9D9] p-2.5 rounded-lg text-xs bg-white text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-[9px] font-bold text-[#393E46] uppercase mb-1">Max Rent Budget (INR)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="10000"
                max="80000"
                step="2000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="flex-1 h-1.5 bg-[#EEEEEE] rounded-lg appearance-none cursor-pointer accent-[#00ADB5]"
              />
              <span className="text-[10px] font-bold text-[#222831] tabular-nums">₹{(priceMax/1000).toFixed(0)}k</span>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#393E46] uppercase mb-1">BHK sizing</label>
            <select
              value={bhkFilter}
              onChange={(e) => setBhkFilter(e.target.value)}
              className="w-full border border-[#D9D9D9] p-2 rounded-lg text-xs bg-white text-[#222831] focus:outline-none"
            >
              <option value="all">All Sizing</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#393E46] uppercase mb-1">Furnishing</label>
            <select
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="w-full border border-[#D9D9D9] p-2 rounded-lg text-xs bg-white text-[#222831] focus:outline-none"
            >
              <option value="all">Any Furnishing</option>
              <option value="furnished">Fully Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="readyToMove"
              checked={readyToMove}
              onChange={(e) => setReadyToMove(e.target.checked)}
              className="rounded border-[#D9D9D9] text-[#00ADB5] focus:ring-[#00ADB5]"
            />
            <label htmlFor="readyToMove" className="text-xs font-semibold text-[#222831] cursor-pointer">
              Vetted / Verified Only
            </label>
          </div>
        </div>
      </div>

      {/* Property Listing grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((p) => {
          const isFav = favorites.includes(p.id);
          const isCompared = comparedIds.includes(p.id);
          return (
            <div
              key={p.id}
              onClick={() => { setSelectedPropId(p.id); setActiveTab('detail'); }}
              className="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm"
            >
              {/* Image with carousel representation */}
              <div className="relative h-44 bg-[#EEEEEE]">
                <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => toggleFav(p.id, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-[#D9D9D9] flex items-center justify-center shadow-sm text-xs"
                >
                  {isFav ? '⭐' : '☆'}
                </button>
                <span className="absolute bottom-3 left-3 bg-[#00ADB5] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ★ {p.trustScore > 90 ? '4.8' : '4.2'} Rating
                </span>
              </div>

              {/* Specs */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#00ADB5] font-bold uppercase">{p.locality}</span>
                    <span className="text-[10px] text-[#393E46] font-semibold tabular-nums">{p.sizeSqFt} sq ft</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#222831] line-clamp-1 leading-snug">{p.title}</h4>
                </div>

                <div className="border-t border-[#EEEEEE] pt-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="block text-[9px] text-[#393E46] uppercase">Monthly Rent</span>
                    <strong className="text-sm font-extrabold text-[#222831] tabular-nums">
                      ₹{p.price.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => toggleCompare(p.id, e)}
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
                        isCompared 
                          ? 'bg-[#393E46] border-[#393E46] text-white' 
                          : 'bg-white border-[#D9D9D9] text-[#393E46] hover:border-[#393E46]'
                      }`}
                    >
                      {isCompared ? 'Compared' : 'Compare'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveTab('chat'); }}
                      className="bg-[#00ADB5] hover:bg-[#008C93] text-white px-2 py-1 rounded-lg text-[9px] font-bold shadow-sm transition-colors"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Property Detail View
───────────────────────────────────────────────────────────── */
function DetailTab({ propId, setSelectedPropId, favorites, setFavorites }) {
  const listing = LISTINGS.find(p => p.id === propId) || LISTINGS[0];
  const [activePhoto, setActivePhoto] = useState(0);

  const toggleFav = (id) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-6">
        {/* Header Title / Price */}
        <div className="flex justify-between items-start border-b border-[#EEEEEE] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#00ADB5] uppercase tracking-wider">{listing.locality}</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full uppercase">
                Ready to Move
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#222831] mt-1">{listing.title}</h1>
          </div>
          <div className="text-right">
            <span className="block text-2xl font-extrabold text-[#222831] tabular-nums">
              ₹{listing.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#393E46] font-bold uppercase block">Monthly Rent</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-80 bg-[#EEEEEE] rounded-xl overflow-hidden border border-[#D9D9D9]">
            <img src={listing.photos[activePhoto]} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {listing.photos.map((ph, i) => (
              <div 
                key={i} 
                onClick={() => setActivePhoto(i)}
                className={`h-24 bg-[#EEEEEE] rounded-lg overflow-hidden border-2 cursor-pointer ${
                  activePhoto === i ? 'border-[#00ADB5]' : 'border-transparent'
                }`}
              >
                <img src={ph} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Specs & Amenities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#EEEEEE]">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#222831] uppercase tracking-wider">Property Specifications</h3>
            <div className="grid grid-cols-3 gap-3 text-xs text-[#222831] font-semibold">
              <div className="bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9] text-center">
                {listing.bhk} BHK Sizing
              </div>
              <div className="bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9] text-center">
                {listing.bathrooms} Bathrooms
              </div>
              <div className="bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9] text-center">
                {listing.sizeSqFt} sq ft
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {listing.features.map((feat, idx) => (
                  <span key={idx} className="text-xs font-semibold bg-[#EEEEEE] text-[#393E46] border border-[#D9D9D9] px-3 py-1 rounded-full">
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#222831] uppercase tracking-wider">Commute & Safety Analysis</h3>
            <div className="space-y-3 text-xs text-[#222831]">
              <div className="bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9] flex justify-between items-center">
                <span>Nearby Schools</span>
                <span className="font-bold">{listing.schoolDistance} km (Vastrapur Intl School)</span>
              </div>
              <div className="bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9] flex justify-between items-center">
                <span>Nearby Hospitals</span>
                <span className="font-bold">{listing.hospitalDistance} km (Zydus Care)</span>
              </div>
              <div className="bg-[#EEEEEE] p-3 rounded-lg border border-[#D9D9D9] flex justify-between items-center">
                <span>Safety / Crime Score</span>
                <span className="font-bold text-[#22C55E]">Very Low Risk (0.4/1000)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews section */}
        <div className="pt-4 border-t border-[#EEEEEE] space-y-3">
          <h3 className="font-bold text-sm text-[#222831] uppercase tracking-wider">Tenant Reviews</h3>
          <div className="space-y-3 text-xs text-[#393E46]">
            <div className="bg-[#EEEEEE]/40 border border-[#D9D9D9] p-4 rounded-xl">
              <div className="flex justify-between items-baseline mb-1">
                <strong>Aniket Patel</strong>
                <span className="text-[10px] text-[#393E46]/60">5 stars • 2 weeks ago</span>
              </div>
              <p>Excellent locality. Commutes to the metro are extremely fast and water supply is consistent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Saved Properties List
───────────────────────────────────────────────────────────── */
function SavedTab({ favorites, setFavorites, setSelectedPropId, setActiveTab }) {
  const savedProps = LISTINGS.filter(p => favorites.includes(p.id));

  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
      <h3 className="text-lg font-bold text-[#222831]">Saved Properties Collection</h3>
      
      {savedProps.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#393E46] border border-dashed border-[#D9D9D9] rounded-xl bg-[#EEEEEE]/20">
          No saved properties yet. Browse search to save listings.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedProps.map((p) => (
            <div 
              key={p.id}
              onClick={() => { setSelectedPropId(p.id); setActiveTab('detail'); }}
              className="bg-[#EEEEEE]/40 border border-[#D9D9D9] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#393E46] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-16 h-12 rounded-lg bg-white overflow-hidden border border-[#D9D9D9]">
                  <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <strong className="block text-xs text-[#222831] line-clamp-1">{p.title}</strong>
                  <span className="block text-[9px] text-[#393E46] font-semibold">{p.locality} • {p.bhk} BHK</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="block text-xs font-bold text-[#222831] tabular-nums">₹{p.price.toLocaleString('en-IN')}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFavorites((prev) => prev.filter(fId => fId !== p.id));
                  }}
                  className="text-[10px] font-bold text-[#EF4444] hover:underline"
                >
                  Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Side-by-Side Property Comparison
───────────────────────────────────────────────────────────── */
function CompareTab({ comparedIds, setComparedIds, setSelectedPropId, setActiveTab }) {
  const comparedProps = LISTINGS.filter(p => comparedIds.includes(p.id));

  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
      <h3 className="text-lg font-bold text-[#222831]">Property Comparison Matrix</h3>
      
      {comparedProps.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#393E46] border border-dashed border-[#D9D9D9] rounded-xl bg-[#EEEEEE]/20">
          No listings selected for comparison. Use Search tab to add properties.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#D9D9D9] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
                <th className="p-4">Specification</th>
                {comparedProps.map(p => (
                  <th key={p.id} className="p-4">
                    <span className="block font-bold text-[#222831] line-clamp-1">{p.title}</span>
                    <button 
                      onClick={() => setComparedIds(prev => prev.filter(cId => cId !== p.id))}
                      className="text-[9px] text-[#EF4444] font-semibold hover:underline mt-0.5"
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEEE] text-[#222831] font-semibold">
              <tr>
                <td className="p-4 bg-[#EEEEEE]/20 font-bold">Monthly Rent</td>
                {comparedProps.map(p => (
                  <td key={p.id} className="p-4 tabular-nums text-sm font-extrabold text-[#00ADB5]">₹{p.price.toLocaleString('en-IN')}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 bg-[#EEEEEE]/20 font-bold">Sizing (Sq Ft)</td>
                {comparedProps.map(p => (
                  <td key={p.id} className="p-4 tabular-nums">{p.sizeSqFt} sq ft</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 bg-[#EEEEEE]/20 font-bold">Layout (BHK)</td>
                {comparedProps.map(p => (
                  <td key={p.id} className="p-4">{p.bhk} BHK Sizing</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 bg-[#EEEEEE]/20 font-bold">Safety / Trust</td>
                {comparedProps.map(p => (
                  <td key={p.id} className="p-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      p.isSuspicious ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#22C55E]/10 text-[#22C55E]'
                    }`}>
                      {p.trustScore}% Trust
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Visit Scheduler
───────────────────────────────────────────────────────────── */
function SchedulerTab() {
  const [scheduledVisits, setScheduledVisits] = useState([
    { id: 'v-1', property: 'Modern 3 BHK in Vastrapur Heights', broker: 'Amit Trivedi', date: '2026-08-05', time: '11:00 AM', status: 'upcoming' },
    { id: 'v-2', property: 'Luxury 4 BHK Penthouse at Bodakdev Vista', broker: 'Rohan Shah', date: '2026-08-07', time: '04:30 PM', status: 'upcoming' },
    { id: 'v-3', property: 'Cozy 2 BHK in Satellite enclave', broker: 'Ketan Patel', date: '2026-07-28', time: '02:00 PM', status: 'completed' }
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Calendar Grid Viewport */}
      <div className="lg:col-span-7 bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">August 2026 Calendar</h3>
        
        {/* Calendar Grid header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9] pb-2">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        {/* Calendar days grid (Ahmedabad Demo) */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold">
          {Array.from({ length: 31 }).map((_, i) => {
            const dayNum = i + 1;
            const hasVisit = dayNum === 5 || dayNum === 7;
            return (
              <div 
                key={i} 
                className={`h-10 border rounded-lg flex flex-col justify-between p-1 transition-all ${
                  hasVisit 
                    ? 'border-[#00ADB5] bg-[#00ADB5]/5 text-[#00ADB5]' 
                    : 'border-[#EEEEEE] bg-white text-[#393E46]'
                }`}
              >
                <span className="text-[10px]">{dayNum}</span>
                {hasVisit && <span className="w-1.5 h-1.5 bg-[#00ADB5] rounded-full mx-auto mb-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booked Visit List */}
      <div className="lg:col-span-5 bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Schedule List</h3>
        <div className="space-y-4">
          {scheduledVisits.map((v) => (
            <div key={v.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 text-xs space-y-2">
              <div className="flex justify-between items-start">
                <strong className="text-[#222831] line-clamp-1">{v.property}</strong>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  v.status === 'upcoming' ? 'bg-[#00ADB5]/10 text-[#00ADB5]' : 'bg-[#393E46]/10 text-[#393E46]'
                }`}>
                  {v.status}
                </span>
              </div>
              <div className="text-[10px] text-[#393E46] font-medium">
                <div>Broker: <strong>{v.broker}</strong></div>
                <div>Date: {v.date} ({v.time})</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Inbox Messages
───────────────────────────────────────────────────────────── */
function ChatTab() {
  const [activeChat, setActiveChat] = useState('c-1');
  const [messages, setMessages] = useState([
    { id: 'm-1', chatId: 'c-1', sender: 'broker', text: 'Hi! Vastrapur Heights tour is set. Shall we sync up tomorrow?', date: '11:02 AM' },
    { id: 'm-2', chatId: 'c-1', sender: 'user', text: 'Yes, 11:00 AM works perfectly for me. Please share coordinates.', date: '11:05 AM' },
    { id: 'm-3', chatId: 'c-2', sender: 'owner', text: 'Hi, rent deposit for Bodakdev Vista is fixed at 2x monthly rent.', date: 'Yesterday' }
  ]);

  const [inputMsg, setInputMsg] = useState('');

  const activeMessages = messages.filter(m => m.chatId === activeChat);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const newMsg = {
      id: 'm-new-' + Math.random(),
      chatId: activeChat,
      sender: 'user',
      text: inputMsg,
      date: 'Just now'
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-xl flex h-[calc(100vh-12rem)] shadow-sm overflow-hidden animate-fade-in">
      {/* Chats sidebar */}
      <div className="w-1/3 border-r border-[#D9D9D9] bg-[#EEEEEE]/30 flex flex-col">
        <div className="p-4 border-b border-[#D9D9D9] font-bold text-sm text-[#222831]">Inbox Conversations</div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#EEEEEE]">
          {[
            { id: 'c-1', title: 'Broker: Amit Trivedi', subtitle: 'Vastrapur Heights Tour' },
            { id: 'c-2', title: 'Owner: Rajesh Patel', subtitle: 'Bodakdev Vista Deposit' }
          ].map((chat) => {
            const isSelected = activeChat === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-white font-bold' : 'hover:bg-[#EEEEEE]/45'
                }`}
              >
                <div className="text-xs text-[#222831]">{chat.title}</div>
                <div className="text-[10px] text-[#393E46] truncate mt-0.5">{chat.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chats body */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Chat header */}
        <div className="p-4 border-b border-[#D9D9D9] bg-[#EEEEEE] font-bold text-xs text-[#222831]">
          {activeChat === 'c-1' ? 'Amit Trivedi (Broker)' : 'Rajesh Patel (Owner)'}
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeMessages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg border max-w-sm text-xs leading-relaxed ${
                  isMe ? 'bg-[#00ADB5] border-[#00ADB5] text-white' : 'bg-[#EEEEEE] border-[#D9D9D9] text-[#222831]'
                }`}>
                  <p>{m.text}</p>
                  <span className="block text-[8px] text-right mt-1 opacity-70 tabular-nums">{m.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#D9D9D9] bg-[#EEEEEE]/20 flex space-x-2">
          <input
            type="text"
            placeholder="Type message here..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 border border-[#D9D9D9] p-2.5 rounded-lg text-xs bg-white text-[#222831] focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-[#00ADB5] hover:bg-[#008C93] text-white px-4 rounded-lg text-xs font-semibold transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: AI Relocation Assistant
───────────────────────────────────────────────────────────── */
function AssistantTab() {
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: "Welcome to MoveSmart AI Relocation Suite! I can evaluate budgets, calculate office commutes, and flag pricing anomalies. How may I assist you today?" }
  ]);
  const [inp, setInp] = useState('');
  const [typing, setTyping] = useState(false);

  const handleSend = () => {
    if (!inp.trim()) return;
    setChatLog((prev) => [...prev, { sender: 'user', text: inp }]);
    setInp('');
    setTyping(true);

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev, 
        { sender: 'ai', text: "Evaluated locality matches for Ahmedabad. Vastrapur Heights rent is ₹34k/mo, which lies within your rent parameters." }
      ]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="bg-white border border-[#D9D9D9] rounded-xl flex flex-col h-[calc(100vh-12rem)] shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-[#D9D9D9] bg-[#EEEEEE] font-bold text-xs text-[#222831]">
        Gemini Assistant Chatbot
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatLog.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-xl border max-w-md text-xs leading-relaxed ${
              m.sender === 'user' ? 'bg-[#00ADB5] border-[#00ADB5] text-white' : 'bg-[#EEEEEE] border-[#D9D9D9] text-[#222831]'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && <div className="text-xs text-[#393E46] animate-pulse">AI is compiling insights...</div>}
      </div>
      <div className="p-4 border-t border-[#D9D9D9] flex space-x-2 bg-[#EEEEEE]/30">
        <input
          type="text"
          placeholder="Ask assistance..."
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          className="flex-1 border border-[#D9D9D9] p-2.5 rounded-lg text-xs bg-white text-[#222831] focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="bg-[#00ADB5] text-white px-4 rounded-lg text-xs font-semibold">
          Ask
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: Profile Settings
───────────────────────────────────────────────────────────── */
function ProfileTab() {
  const { profile, updateProfile } = useContext(ProfileContext);
  
  const [budget, setBudget] = useState(profile?.rent_budget || 35000);
  const [commute, setCommute] = useState(profile?.commute_tolerance || 25);
  const [loc, setLoc] = useState(profile?.work_location || 'Vastrapur');

  const [notifEmails, setNotifEmails] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);

  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      rent_budget: Number(budget),
      commute_tolerance: Number(commute),
      work_location: loc
    });
    setMessage('Profile settings saved successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-6 animate-fade-in">
      <h3 className="text-lg font-bold text-[#222831]">My Relocation Profile</h3>
      
      {message && (
        <div className="bg-[#22C55E]/10 border border-[#22C55E] p-3 rounded-lg text-xs text-[#22C55E] font-semibold text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs text-[#222831]">
        {/* Core preferences */}
        <div className="space-y-4">
          <h4 className="font-bold text-[#00ADB5] uppercase tracking-wider">Preferences Configurations</h4>
          
          <div>
            <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Office Location</label>
            <select
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              className="w-full border border-[#D9D9D9] p-2.5 rounded-lg bg-white text-[#222831]"
            >
              <option value="Vastrapur">Vastrapur</option>
              <option value="Satellite">Satellite</option>
              <option value="Bodakdev">Bodakdev</option>
              <option value="Thaltej">Thaltej</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Monthly Rent Target Limit (INR)</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="10000"
                max="80000"
                step="2000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full h-1.5 bg-[#EEEEEE] rounded-lg appearance-none cursor-pointer accent-[#00ADB5]"
              />
              <span className="font-bold w-20 tabular-nums">₹{Number(budget).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Commute tolerance distance (mins)</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={commute}
                onChange={(e) => setCommute(e.target.value)}
                className="w-full h-1.5 bg-[#EEEEEE] rounded-lg appearance-none cursor-pointer accent-[#00ADB5]"
              />
              <span className="font-bold w-12 tabular-nums">{commute} m</span>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="pt-4 border-t border-[#EEEEEE] space-y-3">
          <h4 className="font-bold text-[#00ADB5] uppercase tracking-wider">Uploaded Documents Verification</h4>
          <div className="space-y-2">
            {[
              { doc: 'KYC PAN Card', status: 'verified' },
              { doc: 'Salary Slips (3 months)', status: 'verified' },
              { doc: 'Employer Reference Letter', status: 'pending' }
            ].map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-[#EEEEEE]/40 p-3 rounded-lg border border-[#D9D9D9]">
                <span className="font-semibold">{d.doc}</span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  d.status === 'verified' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="pt-4 border-t border-[#EEEEEE] space-y-3">
          <h4 className="font-bold text-[#00ADB5] uppercase tracking-wider">Notification Preferences</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#393E46]">Receive Price Drop Email Alerts</span>
              <input
                type="checkbox"
                checked={notifEmails}
                onChange={(e) => setNotifEmails(e.target.checked)}
                className="rounded border-[#D9D9D9] text-[#00ADB5] focus:ring-[#00ADB5]"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#393E46]">Receive System Notification Pings</span>
              <input
                type="checkbox"
                checked={notifAlerts}
                onChange={(e) => setNotifAlerts(e.target.checked)}
                className="rounded border-[#D9D9D9] text-[#00ADB5] focus:ring-[#00ADB5]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#00ADB5] hover:bg-[#008C93] text-white px-6 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          Save System Configurations
        </button>
      </form>
    </div>
  );
}
