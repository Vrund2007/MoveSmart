// src/pages/BrokerDashboard.jsx — Master Broker CRM Portal (PRD §6.3, Architecture.md §4.3, Phase 11)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// API Clients
import {
  getBrokerDashboard,
  getBrokerListings,
  createBrokerListing,
  updateBrokerListing,
  deleteBrokerListing,
  matchClient
} from '../api/broker';
import { getClients, createClient, updateClient, deleteClient, addClientNote } from '../api/clients';
import { getLeads, updateLeadStatus, updateLeadDetails } from '../api/leads';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { getCommissions, createCommission, updateCommissionStatus } from '../api/commissions';
import { getBrokerAnalytics, getBrokerReport, exportBrokerReportCSV } from '../api/brokerAnalytics';
import { getSeekerVisits, createVisit, updateVisitStatus } from '../api/visits';

// Common Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StatusBadge from '../components/listings/StatusBadge';
import ListingForm from '../components/owner/ListingForm';
import LocalityCard from '../components/recommendations/LocalityCard';
import ListingCard from '../components/listings/ListingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

// CRM Module Components
import PipelineBoard from '../components/crm/PipelineBoard';
import ClientCard from '../components/crm/ClientCard';
import TaskCard from '../components/crm/TaskCard';
import VisitCalendarView from '../components/crm/VisitCalendarView';
import CommissionWidget from '../components/crm/CommissionWidget';
import AnalyticsCharts from '../components/crm/AnalyticsCharts';
import ActivityFeed from '../components/crm/ActivityFeed';

export default function BrokerDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // 1. Dashboard Overview State
  const [dashboardData, setDashboardData] = useState(null);
  const [dashLoading, setDashLoading] = useState(false);

  // 2. Inventory State
  const [inventory, setInventory] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);

  // 3. Client CRM State
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: '', email: '', phone: '', budget: 30000, preferred_locations: 'Vastrapur, Navrangpura', lifestyle: 'vibrant', status: 'active'
  });

  // 4. Lead Pipeline State
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // 5. Tasks State
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: new Date().toISOString().split('T')[0] });

  // 6. Visits State
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);

  // 7. Commissions State
  const [commissions, setCommissions] = useState([]);
  const [commLoading, setCommLoading] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [commForm, setCommForm] = useState({ lead_id: '', amount: '', listing_id: '' });

  // 8. Analytics & AI Matcher State
  const [analytics, setAnalytics] = useState(null);
  const [clientMatchForm, setClientMatchForm] = useState({ rent_budget: 30000, commute_tolerance_minutes: 30, lifestyle_pref: 'vibrant' });
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  // 9. Reports State
  const [reportType, setReportType] = useState('leads');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Fetch Dashboard Summary
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true);
    try {
      const res = await getBrokerDashboard();
      setDashboardData(res.data || res);
    } catch {
      // fallback handled gracefully
    } finally {
      setDashLoading(false);
    }
  }, []);

  // Fetch Inventory
  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await getBrokerListings();
      setInventory(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setInventory([]);
    } finally {
      setInvLoading(false);
    }
  }, []);

  // Fetch Clients
  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const res = await getClients();
      setClients(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  // Fetch Leads
  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await getLeads();
      setLeads(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await getTasks();
      setTasks(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Fetch Visits
  const fetchVisits = useCallback(async () => {
    setVisitsLoading(true);
    try {
      const res = await getSeekerVisits();
      setVisits(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  }, []);

  // Fetch Commissions
  const fetchCommissions = useCallback(async () => {
    setCommLoading(true);
    try {
      const res = await getCommissions();
      setCommissions(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setCommissions([]);
    } finally {
      setCommLoading(false);
    }
  }, []);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await getBrokerAnalytics();
      setAnalytics(res.data || res);
    } catch {
      setAnalytics({});
    }
  }, []);

  // Fetch Report Data
  const fetchReport = useCallback(async (type) => {
    setReportLoading(true);
    try {
      const res = await getBrokerReport(type);
      setReportData(res.data || res);
    } catch {
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchInventory();
    fetchClients();
    fetchLeads();
    fetchTasks();
    fetchVisits();
    fetchCommissions();
    fetchAnalytics();
  }, [fetchDashboard, fetchInventory, fetchClients, fetchLeads, fetchTasks, fetchVisits, fetchCommissions, fetchAnalytics]);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReport(reportType);
    }
  }, [activeTab, reportType, fetchReport]);

  // Handlers for Client CRUD
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const locArray = typeof clientForm.preferred_locations === 'string'
      ? clientForm.preferred_locations.split(',').map(s => s.trim())
      : clientForm.preferred_locations;

    try {
      if (editingClient) {
        await updateClient(editingClient._id, { ...clientForm, preferred_locations: locArray });
      } else {
        await createClient({ ...clientForm, preferred_locations: locArray });
      }
      setIsClientModalOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save client profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavoriteClient = async (client) => {
    try {
      await updateClient(client._id, { favorite: !client.favorite });
      fetchClients();
    } catch {
      // ignore
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Are you sure you want to delete client ${client.name}?`)) return;
    try {
      await deleteClient(client._id);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete client.');
    }
  };

  // Handlers for Task CRUD
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask(taskForm);
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: new Date().toISOString().split('T')[0] });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (taskId, nextStatus) => {
    try {
      await updateTask(taskId, { status: nextStatus });
      fetchTasks();
    } catch {
      // ignore
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch {
      // ignore
    }
  };

  // Handlers for Lead Pipeline
  const handleLeadStatusChange = async (leadId, newStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid lead status transition.');
    }
  };

  const handleAddLeadNote = async (leadId, noteText) => {
    try {
      await updateLeadDetails(leadId, { note: noteText });
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add note.');
    }
  };

  // Handlers for Visits
  const handleScheduleVisit = async (visitPayload) => {
    await createVisit(visitPayload);
    fetchVisits();
  };

  const handleUpdateVisitStatus = async (visitId, status) => {
    await updateVisitStatus(visitId, status);
    fetchVisits();
  };

  // Handlers for Inventory
  const handleCreateListingSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await createBrokerListing({ ...formData, owner_id: formData.owner_id || '66b0ef3a9d8c2f1e4a7b901a' });
      setIsCreateListingOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditListingSubmit = async (formData) => {
    if (!editingListing) return;
    setSubmitting(true);
    try {
      await updateBrokerListing(editingListing._id, formData);
      setEditingListing(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListingConfirm = async () => {
    if (!deletingListing) return;
    try {
      await deleteBrokerListing(deletingListing._id);
      setDeletingListing(null);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Handlers for Commissions
  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCommission({
        lead_id: commForm.lead_id,
        amount: Number(commForm.amount),
        listing_id: commForm.listing_id || null,
        payment_status: 'pending'
      });
      setIsCommModalOpen(false);
      setCommForm({ lead_id: '', amount: '', listing_id: '' });
      fetchCommissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log commission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCommissionPayment = async (commId, currentStatus) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      await updateCommissionStatus(commId, nextStatus);
      fetchCommissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  // Handler for AI Client Matcher
  const handleClientMatchSubmit = async (e) => {
    e.preventDefault();
    setMatchLoading(true);
    try {
      const res = await matchClient({
        rent_budget: Number(clientMatchForm.rent_budget),
        commute_tolerance_minutes: Number(clientMatchForm.commute_tolerance_minutes),
        lifestyle_pref: clientMatchForm.lifestyle_pref
      });
      setMatchResult(res.data || res);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate client match.');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const widgets = dashboardData?.widgets || {};

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Logo">🤝</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Broker CRM Portal</span>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {[
              { id: 'overview', label: 'CRM Overview', icon: '📊' },
              { id: 'inventory', label: `Inventory (${inventory.length})`, icon: '📋' },
              { id: 'clients', label: `Clients (${clients.length})`, icon: '👥' },
              { id: 'leads', label: `Lead Pipeline (${leads.length})`, icon: '⚡' },
              { id: 'visits', label: `Visits (${visits.length})`, icon: '📅' },
              { id: 'commissions', label: 'Commissions', icon: '💵' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'client-match', label: 'AI Matcher', icon: '🎯' },
              { id: 'tasks', label: `Task Manager (${tasks.length})`, icon: '✅' },
              { id: 'reports', label: 'Reports', icon: '📄' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white shadow-sm' : 'text-[#393E46] hover:bg-[#EEEEEE]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#D9D9D9]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-extrabold text-[#222831] capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-[#EEEEEE] border border-[#D9D9D9] rounded-full text-[#00ADB5] uppercase">
              Broker CRM
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold text-[#393E46]">
            <span>Welcome, <strong>{user?.name || 'Broker Partner'}</strong></span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {/* TAB 1: CRM OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white border border-[#D9D9D9]">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Total Listings</span>
                  <span className="text-2xl font-black text-[#00ADB5]">{widgets.total_listings || inventory.length}</span>
                  <span className="text-[10px] text-gray-400 block mt-1">{widgets.active_listings || 0} active on portal</span>
                </Card>
                <Card className="p-4 bg-white border border-[#D9D9D9]">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Active Clients</span>
                  <span className="text-2xl font-black text-[#222831]">{widgets.active_clients || clients.length}</span>
                  <span className="text-[10px] text-gray-400 block mt-1">In active search funnel</span>
                </Card>
                <Card className="p-4 bg-white border border-[#D9D9D9]">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">New Leads</span>
                  <span className="text-2xl font-black text-amber-600">{widgets.new_leads || leads.length}</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Seeker enquiries received</span>
                </Card>
                <Card className="p-4 bg-white border border-[#D9D9D9]">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Performance Rating</span>
                  <span className="text-2xl font-black text-green-600">{widgets.performance_score || 85}/100</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Conversion efficiency</span>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <ActivityFeed activities={dashboardData?.recent_activity} />
                </div>

                <div className="space-y-4">
                  <Card className="p-5 bg-white border border-[#D9D9D9] space-y-3">
                    <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider border-b border-[#D9D9D9] pb-2">
                      Quick CRM Actions
                    </h4>
                    <div className="space-y-2">
                      <Button variant="primary" size="sm" className="w-full justify-start" onClick={() => setIsClientModalOpen(true)}>
                        + Add New Client
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setIsCreateListingOpen(true)}>
                        + Add Property Listing
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setIsTaskModalOpen(true)}>
                        + Create Broker Task
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setActiveTab('client-match')}>
                        🎯 Run AI Client Matcher
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGED INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-[#222831]">Managed Property Inventory</h3>
                <Button variant="primary" size="sm" onClick={() => setIsCreateListingOpen(true)}>
                  + Add Property (for Owner)
                </Button>
              </div>

              {invLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading inventory..." />
                </div>
              ) : inventory.length === 0 ? (
                <Card className="text-center py-12 text-xs text-[#393E46]/70">
                  No property listings submitted yet. Click "+ Add Property" to register listings.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventory.map((item) => (
                    <Card key={item._id} className="flex flex-col justify-between h-full bg-white relative border border-[#D9D9D9]">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-bold text-base text-[#222831] line-clamp-1">{item.title}</h4>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="text-sm font-bold text-[#00ADB5] mb-1">
                          ₹{item.price?.toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ mo ({item.deal_type})</span>
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          {item.bhk} BHK • {item.locality}
                        </p>

                        {item.status === 'rejected' && item.rejection_reason && (
                          <div className="bg-red-50 border border-red-200 rounded p-2.5 text-xs mb-3">
                            <span className="font-bold text-red-600 block mb-1">Rejection Reason:</span>
                            <p className="italic text-[#222831]">"{item.rejection_reason}"</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#D9D9D9] flex justify-end gap-2 text-xs font-semibold">
                        <button onClick={() => setEditingListing(item)} className="text-[#00ADB5] hover:underline">
                          Edit
                        </button>
                        <button onClick={() => setDeletingListing(item)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLIENT MANAGEMENT CRM */}
          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#222831]">Client CRM Database</h3>
                  <p className="text-xs text-[#393E46]">Manage accommodation seeker clients and their property preferences.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => { setEditingClient(null); setClientForm({ name: '', email: '', phone: '', budget: 30000, preferred_locations: '', lifestyle: 'vibrant', status: 'active' }); setIsClientModalOpen(true); }}>
                  + Register Client Profile
                </Button>
              </div>

              {clientsLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Fetching client CRM database..." />
                </div>
              ) : clients.length === 0 ? (
                <Card className="text-center py-12 text-xs text-[#393E46]/70">
                  No client profiles registered. Click "+ Register Client Profile" to create one.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clients.map((c) => (
                    <ClientCard
                      key={c._id}
                      client={c}
                      onEdit={(clientToEdit) => {
                        setEditingClient(clientToEdit);
                        setClientForm({
                          name: clientToEdit.name,
                          email: clientToEdit.email,
                          phone: clientToEdit.phone,
                          budget: clientToEdit.budget,
                          preferred_locations: Array.isArray(clientToEdit.preferred_locations) ? clientToEdit.preferred_locations.join(', ') : clientToEdit.preferred_locations,
                          lifestyle: clientToEdit.lifestyle || 'vibrant',
                          status: clientToEdit.status || 'active'
                        });
                        setIsClientModalOpen(true);
                      }}
                      onDelete={handleDeleteClient}
                      onToggleFavorite={handleToggleFavoriteClient}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEAD PIPELINE */}
          {activeTab === 'leads' && (
            <div className="animate-fade-in">
              {leadsLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Fetching leads pipeline..." />
                </div>
              ) : (
                <PipelineBoard
                  leads={leads}
                  onUpdateStatus={handleLeadStatusChange}
                  onAddNote={handleAddLeadNote}
                />
              )}
            </div>
          )}

          {/* TAB 5: VISIT CALENDAR */}
          {activeTab === 'visits' && (
            <div className="animate-fade-in">
              {visitsLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading visits calendar..." />
                </div>
              ) : (
                <VisitCalendarView
                  visits={visits}
                  onScheduleVisit={handleScheduleVisit}
                  onUpdateVisitStatus={handleUpdateVisitStatus}
                />
              )}
            </div>
          )}

          {/* TAB 6: COMMISSIONS */}
          {activeTab === 'commissions' && (
            <div className="animate-fade-in">
              {commLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading commission ledger..." />
                </div>
              ) : (
                <CommissionWidget
                  commissions={commissions}
                  onLogCommission={() => setIsCommModalOpen(true)}
                  onToggleStatus={handleToggleCommissionPayment}
                />
              )}
            </div>
          )}

          {/* TAB 7: PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="animate-fade-in">
              <AnalyticsCharts analytics={analytics || {}} />
            </div>
          )}

          {/* TAB 8: AI CLIENT MATCHER */}
          {activeTab === 'client-match' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <Card className="space-y-4 bg-white border border-[#D9D9D9]">
                <h3 className="font-bold text-lg text-[#222831]">AI Client Matcher</h3>
                <p className="text-xs text-[#393E46]">
                  Match client requirements with regional locality scores and approved inventory using the MoveSmart recommendation engine.
                </p>

                <form onSubmit={handleClientMatchSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Client Monthly Budget (₹)"
                      type="number"
                      value={clientMatchForm.rent_budget}
                      onChange={(e) => setClientMatchForm({ ...clientMatchForm, rent_budget: e.target.value })}
                    />
                    <Input
                      label="Commute Tolerance (mins)"
                      type="number"
                      value={clientMatchForm.commute_tolerance_minutes}
                      onChange={(e) => setClientMatchForm({ ...clientMatchForm, commute_tolerance_minutes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#393E46] mb-1 block">Lifestyle Preference</label>
                    <select
                      value={clientMatchForm.lifestyle_pref}
                      onChange={(e) => setClientMatchForm({ ...clientMatchForm, lifestyle_pref: e.target.value })}
                      className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
                    >
                      <option value="quiet">Quiet Residential</option>
                      <option value="vibrant">Vibrant & Commercial</option>
                      <option value="transit">Transit Centric</option>
                    </select>
                  </div>
                  <Button type="submit" variant="primary" loading={matchLoading} className="w-full">
                    Compute Client Recommendations
                  </Button>
                </form>
              </Card>

              {matchResult && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider mb-3">Top Recommended Localities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {matchResult.recommended_localities?.map((loc, idx) => (
                        <LocalityCard key={loc.locality} item={loc} rank={idx + 1} isTop={idx === 0} />
                      ))}
                    </div>
                  </div>

                  {matchResult.matched_properties?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider mb-3">Matched Approved Properties</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matchResult.matched_properties.map((prop) => (
                          <ListingCard key={prop._id} listing={prop} onClick={() => navigate(`/listings/${prop._id}`)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: TASK MANAGER */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#222831]">Broker Task Manager</h3>
                  <p className="text-xs text-[#393E46]">Organize follow-up calls, property visits, and client task items.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsTaskModalOpen(true)}>
                  + Create Task
                </Button>
              </div>

              {tasksLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading tasks..." />
                </div>
              ) : tasks.length === 0 ? (
                <Card className="text-center py-12 text-xs text-[#393E46]/70">
                  No active tasks. Click "+ Create Task" to add your first reminder.
                </Card>
              ) : (
                <div className="space-y-3">
                  {tasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      onToggleStatus={handleToggleTaskStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#222831]">Broker Performance Reports</h3>
                  <p className="text-xs text-[#393E46]">Generate structured operational summaries and export CSV data.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="bg-white border border-[#D9D9D9] rounded p-2 text-xs font-bold text-[#222831]"
                  >
                    <option value="leads">Lead Report</option>
                    <option value="commissions">Commission Report</option>
                    <option value="listings">Listing Report</option>
                    <option value="visits">Visit Report</option>
                  </select>

                  <Button variant="secondary" size="sm" onClick={() => exportBrokerReportCSV(reportType)}>
                    📥 Download CSV
                  </Button>
                </div>
              </div>

              {reportLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Generating report..." />
                </div>
              ) : (
                <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
                  <h4 className="font-bold text-sm text-[#222831] capitalize">{reportType} Report Data Preview</h4>
                  <pre className="bg-[#EEEEEE] p-4 rounded-lg text-xs font-mono text-[#222831] overflow-x-auto max-h-96">
                    {JSON.stringify(reportData?.content || reportData, null, 2)}
                  </pre>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {/* Create / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleClientSubmit} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">
              {editingClient ? 'Edit Client Profile' : 'Register New Client'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                placeholder="e.g. Ananya Patel"
              />
              <Input
                label="Email"
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                placeholder="e.g. ananya@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
              />
              <Input
                label="Monthly Rent Budget (₹)"
                type="number"
                value={clientForm.budget}
                onChange={(e) => setClientForm({ ...clientForm, budget: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Preferred Localities (comma separated)"
                value={clientForm.preferred_locations}
                onChange={(e) => setClientForm({ ...clientForm, preferred_locations: e.target.value })}
                placeholder="e.g. Vastrapur, Navrangpura, Bodakdev"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#393E46] mb-1 block">Lifestyle Profile</label>
                <select
                  value={clientForm.lifestyle}
                  onChange={(e) => setClientForm({ ...clientForm, lifestyle: e.target.value })}
                  className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
                >
                  <option value="vibrant">Vibrant & Commercial</option>
                  <option value="quiet">Quiet Residential</option>
                  <option value="transit">Transit Centric</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#393E46] mb-1 block">Status</label>
                <select
                  value={clientForm.status}
                  onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                  className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsClientModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>
                Save Client Profile
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleTaskSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">
              Create Broker Task
            </h3>

            <Input
              label="Task Title"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Call client regarding agreement signature"
            />

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Description</label>
              <textarea
                rows={2}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Additional task details..."
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#393E46] mb-1 block">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#393E46] mb-1 block">Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>
                Save Task
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Listing Modal */}
      {isCreateListingOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] pb-2 border-b border-[#D9D9D9]">
              Add Listing for Property Owner
            </h3>
            <ListingForm
              onSubmit={handleCreateListingSubmit}
              loading={submitting}
              onCancel={() => setIsCreateListingOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] pb-2 border-b border-[#D9D9D9]">
              Edit Listing: {editingListing.title}
            </h3>
            <ListingForm
              initialValues={editingListing}
              onSubmit={handleEditListingSubmit}
              loading={submitting}
              onCancel={() => setEditingListing(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Listing Dialog */}
      {deletingListing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#222831] mb-2">Delete Property Listing?</h3>
            <p className="text-xs text-[#393E46] mb-6">
              Are you sure you want to delete <strong>"{deletingListing.title}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeletingListing(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteListingConfirm}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Log Commission Modal */}
      {isCommModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCommissionSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">Log Deal Commission</h3>
            <p className="text-xs text-[#393E46]">
              Select a converted lead to record commission earnings.
            </p>
            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Select Converted Lead</label>
              <select
                required
                value={commForm.lead_id}
                onChange={(e) => setCommForm({ ...commForm, lead_id: e.target.value })}
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              >
                <option value="">Select a lead...</option>
                {leads.filter(l => l.lead_status === 'converted').map((l) => (
                  <option key={l._id} value={l._id}>{l.seeker_name} (ID: {l._id})</option>
                ))}
              </select>
            </div>
            <Input
              label="Commission Amount (₹)"
              type="number"
              required
              value={commForm.amount}
              onChange={(e) => setCommForm({ ...commForm, amount: e.target.value })}
              placeholder="e.g. 15000"
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsCommModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>Save Commission</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
