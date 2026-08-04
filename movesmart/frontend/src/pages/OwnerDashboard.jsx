// src/pages/OwnerDashboard.jsx
// Premium responsive React + Tailwind CSS dashboard for MoveSmart Property Owners.
// Light Theme, premium clean layout, custom SVG analytics charts, and sidebar navigation.

import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LISTINGS } from '../utils/mockData';

export default function OwnerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active sub-page tab selection
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Mock owner listings state
  const [myProperties, setMyProperties] = useState([
    { id: 'lst-1', title: 'Modern 3 BHK in Vastrapur Heights', locality: 'Vastrapur', bhk: 3, price: 34000, occupancy: 'Occupied', views: 320, inquiries: 18, visits: 8 },
    { id: 'lst-3', title: 'Cozy 2 BHK in Satellite enclave', locality: 'Satellite', bhk: 2, price: 24000, occupancy: 'Vacant', views: 190, inquiries: 12, visits: 4 }
  ]);

  // Booking requests state
  const [bookings, setBookings] = useState([
    { id: 'b-1', seeker: 'Ayush Sharma', property: 'Cozy 2 BHK in Satellite enclave', rentOffer: 24000, status: 'pending' }
  ]);

  // Payments ledger
  const [payments] = useState([
    { id: 'p-1', tenant: 'Ketan Patel', property: 'Modern 3 BHK in Vastrapur Heights', amount: 34000, date: '2026-08-01', status: 'paid' }
  ]);

  // Enquiry messages
  const [enquiries] = useState([
    { id: 'enq-1', seeker: 'Ayush Sharma', property: 'Modern 3 BHK in Vastrapur Heights', email: 'ayush@demo.com', phone: '+91 98765 43210' }
  ]);

  const handleBookingDecision = (id, decision) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: decision } : b));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Logo">🏢</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Property Owner Panel</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'Landlord Overview', icon: '📊' },
              { id: 'properties', label: 'My Properties', icon: '🏠' },
              { id: 'add-property', label: 'Add Property', icon: '＋' },
              { id: 'analytics', label: 'Property Analytics', icon: '📈' },
              { id: 'bookings', label: 'Booking Requests', icon: '⚡' },
              { id: 'messages', label: 'Owner Messages', icon: '💬' },
              { id: 'payments', label: 'Payments & Income', icon: '💵' },
              { id: 'reviews', label: 'Tenant Reviews', icon: '⭐' },
              { id: 'documents', label: 'Title Deeds / Documents', icon: '📋' },
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
            Property Owner Partner
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {activeTab === 'overview' && <OverviewView myProperties={myProperties} payments={payments} />}
          {activeTab === 'properties' && <PropertiesView myProperties={myProperties} />}
          {activeTab === 'add-property' && <AddPropertyView setMyProperties={setMyProperties} setActiveTab={setActiveTab} />}
          {activeTab === 'analytics' && <AnalyticsView myProperties={myProperties} />}
          {activeTab === 'bookings' && <BookingsView bookings={bookings} handleBookingDecision={handleBookingDecision} />}
          {activeTab === 'messages' && <MessagesView enquiries={enquiries} />}
          {activeTab === 'payments' && <PaymentsView payments={payments} />}
          {activeTab === 'reviews' && <ReviewsView />}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUB-VIEWS
───────────────────────────────────────────────────────────── */

function OverviewView({ myProperties, payments }) {
  const totalIncome = payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0);

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold text-[#222831]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#393E46] uppercase">Total Properties</span>
          <div className="text-3xl font-extrabold mt-1 tabular-nums">{myProperties.length} Units</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#393E46] uppercase">Occupancy Rate</span>
          <div className="text-3xl font-extrabold mt-1 text-[#00ADB5] tabular-nums">50%</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#393E46] uppercase">Monthly Income</span>
          <div className="text-3xl font-extrabold mt-1 text-[#22C55E] tabular-nums">₹{totalIncome.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#393E46] uppercase">Pending Bookings</span>
          <div className="text-3xl font-extrabold mt-1 text-[#F59E0B] tabular-nums">1 Request</div>
        </div>
      </div>
    </div>
  );
}

function PropertiesView({ myProperties }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Housing Portfolio</h3>
      <div className="overflow-x-auto border border-[#D9D9D9] rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
              <th className="p-4">Listing</th>
              <th className="p-4">Locality</th>
              <th className="p-4">Sizing</th>
              <th className="p-4">Occupancy Status</th>
              <th className="p-4">Monthly Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEEEEE] text-[#222831] font-semibold">
            {myProperties.map((p) => (
              <tr key={p.id} className="hover:bg-[#EEEEEE]/20 transition-colors">
                <td className="p-4 font-bold">{p.title}</td>
                <td className="p-4 text-[#00ADB5] uppercase">{p.locality}</td>
                <td className="p-4 tabular-nums">{p.bhk} BHK Sizing</td>
                <td className="p-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    p.occupancy === 'Occupied' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                  }`}>
                    {p.occupancy}
                  </span>
                </td>
                <td className="p-4 tabular-nums">₹{p.price.toLocaleString('en-IN')}/mo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddPropertyView({ setMyProperties, setActiveTab }) {
  const [title, setTitle] = useState('');
  const [locality, setLocality] = useState('Vastrapur');
  const [price, setPrice] = useState(20000);
  const [bhk, setBhk] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    const newL = {
      id: 'lst-owner-' + Math.floor(Math.random() * 1000),
      title,
      locality,
      bhk: Number(bhk),
      price: Number(price),
      occupancy: 'Vacant',
      views: 0,
      inquiries: 0,
      visits: 0
    };
    setMyProperties(prev => [...prev, newL]);
    setActiveTab('properties');
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[#EEEEEE] pb-2">Add New Property</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] text-[#393E46] uppercase mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cozy 2 BHK Near Ahmedabad Metro"
            className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-[#393E46] uppercase mb-1">Locality</label>
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
          <div>
            <label className="block text-[10px] text-[#393E46] uppercase mb-1">BHK</label>
            <input
              type="number"
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[#393E46] uppercase mb-1">Monthly Rent Cost (INR)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-[#D9D9D9] p-2.5 rounded-lg text-xs"
          />
        </div>
        <button type="submit" className="bg-[#00ADB5] text-white px-4 py-2 rounded-lg font-bold">
          Submit Listing
        </button>
      </form>
    </div>
  );
}

function AnalyticsView({ myProperties }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Housing Performance Traffic</h3>
      <div className="space-y-4">
        {myProperties.map((p) => (
          <div key={p.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
            <strong>{p.title}</strong>
            <div className="text-right flex space-x-6">
              <div>
                <span className="block text-[9px] text-[#393E46] uppercase">Impressions</span>
                <span className="tabular-nums font-bold text-[#00ADB5]">{p.views}</span>
              </div>
              <div>
                <span className="block text-[9px] text-[#393E46] uppercase">Inquiries</span>
                <span className="tabular-nums font-bold text-[#22C55E]">{p.inquiries}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsView({ bookings, handleBookingDecision }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Booking requests list</h3>
      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
            <div>
              <strong>{b.seeker}</strong>
              <div className="text-[#393E46] mt-0.5">Offered Rent: ₹{b.rentOffer.toLocaleString('en-IN')}/mo on {b.property}</div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleBookingDecision(b.id, 'approved')}
                className="bg-[#22C55E] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleBookingDecision(b.id, 'rejected')}
                className="bg-[#EF4444] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesView({ enquiries }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Seeker Enquiries Inbox</h3>
      {enquiries.map((e) => (
        <div key={e.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 text-xs">
          <strong>{e.seeker}</strong>
          <span className="block text-[10px] text-[#00ADB5] mt-0.5">{e.property}</span>
          <div className="pt-2 mt-2 border-t border-[#D9D9D9] text-[10px] text-[#393E46] space-y-0.5 font-medium">
            <div>Email: {e.email}</div>
            <div>Phone: {e.phone}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentsView({ payments }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Rental Invoice Ledger</h3>
      {payments.map((p) => (
        <div key={p.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
          <div>
            <strong>{p.tenant}</strong>
            <span className="block text-[10px] text-[#393E46] mt-0.5">{p.property}</span>
          </div>
          <div className="text-right">
            <span className="block font-bold text-[#22C55E] tabular-nums">₹{p.amount.toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-[#393E46]/60">{p.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsView() {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm text-center py-12 animate-fade-in text-xs font-semibold text-[#222831]">
      <span className="text-xl">⭐</span>
      <h3 className="text-sm font-bold uppercase tracking-wider mt-2">Tenant Rating Logs</h3>
      <p className="text-xs text-[#393E46] mt-1">Tenant ratings will register here once lease contracts close.</p>
    </div>
  );
}

function DocumentsView() {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Housing Documents Vault</h3>
      <div className="bg-[#EEEEEE]/40 p-3 rounded-lg border border-[#D9D9D9] flex justify-between items-center">
        <span>Vastrapur Heights Title Deed.pdf</span>
        <span className="text-[10px] text-[#00ADB5]">Uploaded</span>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="max-w-md mx-auto bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[#EEEEEE] pb-2">Landlord Credentials</h3>
      <div>
        <span className="block text-[9px] text-[#393E46] uppercase">Verification Status</span>
        <div className="text-[#22C55E] mt-0.5">PAN & Aadhaar Vetted</div>
      </div>
    </div>
  );
}
