// src/pages/BrokerDashboard.jsx
// Premium responsive React + Tailwind CSS dashboard for MoveSmart Brokers.
// Light Theme, premium CRM styling, custom SVG indicators, and side-navigation tabs.

import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LISTINGS } from '../utils/mockData';

export default function BrokerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active sub-page tab
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Mock managed inventory listings
  const [myInventory, setMyInventory] = useState([
    { id: 'lst-1', title: 'Modern 3 BHK in Vastrapur Heights', owner: 'Rajesh Patel', price: 34000, status: 'approved', views: 240, leads: 18 },
    { id: 'lst-2', title: 'Luxury 4 BHK Penthouse at Bodakdev Vista', owner: 'Vikram Shah', price: 65000, status: 'approved', views: 420, leads: 32 },
    { id: 'lst-4', title: 'High-rise 3 BHK near Thaltej Metro', owner: 'Nisha Mehta', price: 31000, status: 'approved', views: 180, leads: 12 },
    { id: 'lst-new-99', title: 'Spacious 3 BHK at Vastrapur Garden', owner: 'Rajesh Patel', price: 33000, status: 'pending', views: 0, leads: 0 }
  ]);

  const handleDeleteListing = (id) => {
    setMyInventory(prev => prev.filter(item => item.id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Broker Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Logo">🤝</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Broker CRM Suite</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'CRM Overview', icon: '📈' },
              { id: 'listings', label: 'My Listings', icon: '📋' },
              { id: 'add-property', label: 'Add Property', icon: '＋' },
              { id: 'leads', label: 'Leads & Enquiries', icon: '⚡' },
              { id: 'clients', label: 'Client Management', icon: '👥' },
              { id: 'schedule', label: 'Schedule Visits', icon: '📅' },
              { id: 'messages', label: 'Broker Inbox', icon: '💬' },
              { id: 'analytics', label: 'Performance Analytics', icon: '📊' },
              { id: 'profile', label: 'Account Profile', icon: '👤' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white' : 'text-[#393E46] hover:bg-[#EEEEEE] hover:text-[#222831]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#D9D9D9]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-[#222831] capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEEEEE] border border-[#D9D9D9] rounded-full text-[#393E46] uppercase">
            Broker Partner
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {activeTab === 'overview' && <OverviewView myInventory={myInventory} setActiveTab={setActiveTab} />}
          {activeTab === 'listings' && <ListingsView myInventory={myInventory} handleDeleteListing={handleDeleteListing} />}
          {activeTab === 'add-property' && <AddPropertyView setMyInventory={setMyInventory} setActiveTab={setActiveTab} />}
          {activeTab === 'leads' && <LeadsView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'messages' && <MessagesView />}
          {activeTab === 'analytics' && <AnalyticsView myInventory={myInventory} />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUB-VIEWS
───────────────────────────────────────────────────────────── */

function OverviewView({ myInventory, setActiveTab }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#393E46] uppercase">Managed Units</span>
          <div className="text-3xl font-extrabold text-[#222831] mt-1 tabular-nums">{myInventory.length}</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#393E46] uppercase">Active Inquiries</span>
          <div className="text-3xl font-extrabold text-[#00ADB5] mt-1 tabular-nums">18 Leads</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#393E46] uppercase">Escrow / Deals Closed</span>
          <div className="text-3xl font-extrabold text-[#22C55E] mt-1 tabular-nums">4 Closed</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] font-bold text-[#393E46] uppercase">Broker Commission</span>
          <div className="text-3xl font-extrabold text-[#222831] mt-1 tabular-nums">₹54,000</div>
        </div>
      </div>

      {/* Property Analytics Graph block */}
      <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Weekly Lead Funnel Conversions</h3>
        <div className="flex items-end justify-between h-40 border-b border-l border-[#D9D9D9] pt-6 px-4">
          {[
            { label: 'Mon', count: 12 }, { label: 'Tue', count: 18 },
            { label: 'Wed', count: 15 }, { label: 'Thu', count: 24 },
            { label: 'Fri', count: 32 }, { label: 'Sat', count: 20 },
            { label: 'Sun', count: 10 }
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center group">
              <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                {bar.count}
              </span>
              <div 
                className="w-7 bg-[#00ADB5] rounded-t-sm group-hover:bg-[#008C93]"
                style={{ height: `${(bar.count / 35) * 110}px` }}
              />
              <span className="text-[9px] text-[#393E46] mt-1">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListingsView({ myInventory, handleDeleteListing }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Managed Housing Inventory</h3>
      <div className="overflow-x-auto border border-[#D9D9D9] rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
              <th className="p-4">Listing Title</th>
              <th className="p-4">Local Owner</th>
              <th className="p-4">Monthly Rate</th>
              <th className="p-4">Approval State</th>
              <th className="p-4 text-right">Delete Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEEEEE] text-[#222831] font-semibold">
            {myInventory.map((item) => (
              <tr key={item.id} className="hover:bg-[#EEEEEE]/20 transition-colors">
                <td className="p-4 font-bold">{item.title}</td>
                <td className="p-4 font-medium text-[#393E46]">{item.owner}</td>
                <td className="p-4 tabular-nums">₹{item.price.toLocaleString('en-IN')}/mo</td>
                <td className="p-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.status === 'approved' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDeleteListing(item.id)}
                    className="text-[10px] font-bold text-[#EF4444] hover:underline"
                  >
                    Delete Listing
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddPropertyView({ setMyInventory, setActiveTab }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [price, setPrice] = useState(25000);
  const [locality, setLocality] = useState('Vastrapur');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !owner) return;
    const newL = {
      id: 'lst-new-' + Math.floor(Math.random() * 1000),
      title,
      owner,
      price: Number(price),
      locality,
      status: 'pending',
      views: 0,
      leads: 0
    };
    setMyInventory(prev => [newL, ...prev]);
    setActiveTab('listings');
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-[#EEEEEE] pb-3">
        <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Multi-Step Property Submission</h3>
        <span className="font-bold text-[#00ADB5]">Step {step} of 3</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Property Name / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spacious 3 BHK at Satellite Heights"
              className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Locality</label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs"
            >
              <option value="Vastrapur">Vastrapur</option>
              <option value="Satellite">Satellite</option>
              <option value="Thaltej">Thaltej</option>
            </select>
          </div>
          <button onClick={() => setStep(2)} className="bg-[#00ADB5] text-white px-4 py-2 rounded-lg font-bold">
            Continue to Pricing
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Monthly Lease Cost (INR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#393E46] uppercase mb-1">Owner Name</label>
            <input
              type="text"
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Vikram Shah"
              className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setStep(1)} className="border border-[#D9D9D9] px-4 py-2 rounded-lg font-bold">
              Back
            </button>
            <button onClick={() => setStep(3)} className="bg-[#00ADB5] text-white px-4 py-2 rounded-lg font-bold">
              Continue to Amenities
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <span className="block text-[10px] font-bold text-[#393E46] uppercase mb-2">Amenities Checklist</span>
            <div className="grid grid-cols-2 gap-2 font-semibold">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded text-[#00ADB5]" />
                <span>Wi-Fi Enabled</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded text-[#00ADB5]" />
                <span>RO Water System</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-[#00ADB5]" />
                <span>Covered Parking</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setStep(2)} className="border border-[#D9D9D9] px-4 py-2 rounded-lg font-bold">
              Back
            </button>
            <button onClick={handleSubmit} className="bg-[#00ADB5] text-white px-4 py-2 rounded-lg font-bold">
              Submit & Register Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadsView() {
  const [leads] = useState([
    { id: 'l-1', seeker: 'Ayush Sharma', budget: 35000, area: 'Vastrapur', priority: 'high', date: '2 hours ago' },
    { id: 'l-2', seeker: 'Rohan Shah', budget: 70000, area: 'Bodakdev', priority: 'medium', date: '1 day ago' }
  ]);

  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Seeker Relocation Leads</h3>
      <div className="space-y-4 text-xs">
        {leads.map((l) => (
          <div key={l.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
            <div>
              <strong className="text-sm text-[#222831]">{l.seeker}</strong>
              <div className="text-[#393E46] mt-0.5">Seeking accommodation in {l.area} • Budget: ₹{l.budget.toLocaleString('en-IN')}/mo</div>
            </div>
            <div className="text-right">
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                l.priority === 'high' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#00ADB5]/10 text-[#00ADB5]'
              }`}>
                {l.priority} Priority
              </span>
              <span className="block text-[9px] text-[#393E46]/60 mt-1">{l.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientsView() {
  const [clients] = useState([
    { id: 'c-1', name: 'Ayush Sharma', type: 'Renter', stage: 'Site Visiting', progress: 60 },
    { id: 'c-2', name: 'Rohan Shah', type: 'Buyer', stage: 'Negotiations', progress: 85 }
  ]);

  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Client Follow-up Timeline</h3>
      <div className="space-y-4 text-xs font-semibold text-[#222831]">
        {clients.map((c) => (
          <div key={c.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/30 space-y-2">
            <div className="flex justify-between">
              <strong>{c.name} ({c.type})</strong>
              <span className="text-[#00ADB5]">{c.stage}</span>
            </div>
            <div className="w-full bg-[#EEEEEE] h-2 rounded-full overflow-hidden">
              <div className="bg-[#00ADB5] h-2 rounded-full" style={{ width: `${c.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleView() {
  const [visits] = useState([
    { id: 'v-1', seeker: 'Ayush Sharma', time: '11:00 AM', date: '2026-08-05', property: 'Modern 3 BHK in Vastrapur Heights' }
  ]);

  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Tour Schedule Calendar</h3>
      {visits.map(v => (
        <div key={v.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
          <div>
            <strong className="text-[#222831]">{v.property}</strong>
            <span className="block text-[10px] text-[#393E46] mt-0.5">Tour requested by {v.seeker}</span>
          </div>
          <div className="text-right text-[#00ADB5] font-bold">
            {v.date} @ {v.time}
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesView() {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm text-center py-12 animate-fade-in">
      <span className="text-2xl">💬</span>
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider mt-2">Chat logs inbox</h3>
      <p className="text-xs text-[#393E46] mt-1">No active conversation threads. Leads will appear here on customer enquiry.</p>
    </div>
  );
}

function AnalyticsView({ myInventory }) {
  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Property View Impression Count</h3>
        <div className="space-y-3 font-semibold text-[#222831]">
          {myInventory.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b border-[#EEEEEE] pb-2">
              <span>{item.title}</span>
              <span className="text-[#00ADB5] tabular-nums font-bold">{item.views} views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="max-w-md mx-auto bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider border-b border-[#EEEEEE] pb-2">Broker Profile Credentials</h3>
      <div>
        <span className="block text-[9px] text-[#393E46] uppercase">RERA Registration</span>
        <div className="text-[#00ADB5] mt-0.5">GUJRERA/AHMED/987654</div>
      </div>
      <div>
        <span className="block text-[9px] text-[#393E46] uppercase">Assigned Office Location</span>
        <div className="mt-0.5">Satellite Main Road Branch, Ahmedabad</div>
      </div>
    </div>
  );
}
