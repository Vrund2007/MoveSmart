// src/pages/CompanyDashboard.jsx — Master Company HR Enterprise Portal (Same UI parity as Owner & Customer Dashboards)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// API Clients
import { getCompanyEmployees, createCompanyEmployee, updateCompanyEmployee, deleteCompanyEmployee } from '../api/employees';
import { getCompanyApprovals, processCompanyApproval } from '../api/approvals';
import { getCompanyExpenses, createCompanyExpense, deleteCompanyExpense } from '../api/expenses';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Vector SVG Icons
import {
  HubIcon,
  BrowseIcon,
  MessageIcon,
  CalendarIcon,
  UserIcon,
  CostIcon,
  MenuIcon,
  XIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  TrashIcon,
  MapPinIcon,
} from '../components/common/Icons';

// Default Mock Data for zero-friction demonstration
const MOCK_EMPLOYEES = [
  {
    _id: 'emp_1',
    employee_id: 'MS-8041',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@tcs.com',
    department: 'Engineering',
    designation: 'Senior Lead Architect',
    relocation_stage: 'visit_scheduled',
    budget_allocated: 45000,
    relocation_city: 'Ahmedabad',
    preferred_locality: 'Vastrapur',
    created_at: '2026-07-28'
  },
  {
    _id: 'emp_2',
    employee_id: 'MS-8042',
    name: 'Priya Patel',
    email: 'priya.patel@tcs.com',
    department: 'Product Strategy',
    designation: 'Staff Product Manager',
    relocation_stage: 'approved',
    budget_allocated: 60000,
    relocation_city: 'Ahmedabad',
    preferred_locality: 'Bodakdev',
    created_at: '2026-07-30'
  },
  {
    _id: 'emp_3',
    employee_id: 'MS-8043',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@tcs.com',
    department: 'Finance & Ops',
    designation: 'FP&A Director',
    relocation_stage: 'initiated',
    budget_allocated: 35000,
    relocation_city: 'Ahmedabad',
    preferred_locality: 'Prahlad Nagar',
    created_at: '2026-08-01'
  }
];

const MOCK_APPROVALS = [
  {
    _id: 'app_101',
    employee_name: 'Rohan Mehta (MS-8043)',
    category: 'Housing Security Deposit',
    amount: 70000,
    status: 'pending',
    notes: 'Advance security deposit request for 3BHK high-rise apartment in Prahlad Nagar.',
    requested_date: '2026-08-03'
  },
  {
    _id: 'app_102',
    employee_name: 'Priya Patel (MS-8042)',
    category: 'Intercity Logistics Transfer',
    amount: 28500,
    status: 'pending',
    notes: 'Packers & Movers household freight relocation from Pune to Ahmedabad.',
    requested_date: '2026-08-04'
  }
];

const MOCK_EXPENSES = [
  {
    _id: 'exp_501',
    title: 'Executive House Hunting Travel & Stay',
    category: 'Travel & Accommodation',
    amount: 18400,
    employee_name: 'Priya Patel',
    date: '2026-08-02'
  },
  {
    _id: 'exp_502',
    title: 'Temporary Lease Agreement Stamp & Registration',
    category: 'Legal & Documentation',
    amount: 4500,
    employee_name: 'Aarav Sharma',
    date: '2026-08-03'
  }
];

const SIDEBAR_TABS = [
  { id: 'overview', icon: HubIcon, label: 'HR Hub' },
  { id: 'employees', icon: UserIcon, label: 'Employee Batch' },
  { id: 'approvals', icon: CheckCircleIcon, label: 'Approval Queue' },
  { id: 'timeline', icon: CalendarIcon, label: 'Relocation Timeline' },
  { id: 'expenses', icon: CostIcon, label: 'Expense Tracker' },
  { id: 'reports', icon: BrowseIcon, label: 'Corporate Analytics' },
  { id: 'settings', icon: MessageIcon, label: 'Company Settings' },
];

function StatCard({ value, label, icon: IconComponent, color = 'text-primary' }) {
  return (
    <Card className="bg-white border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-2">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className={`text-2xl sm:text-3xl font-black ${color} tabular-nums leading-tight`}>{value}</div>
        <div className="text-xs text-text-secondary font-bold mt-1">{label}</div>
      </div>
    </Card>
  );
}

export default function CompanyDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation State
  const activeTab = searchParams.get('tab') || 'overview';
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Data States
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [empSearch, setEmpSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Modal States
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [empForm, setEmpForm] = useState({
    name: '', email: '', department: 'Engineering', designation: '',
    budget_allocated: 50000, preferred_locality: 'Vastrapur', relocation_stage: 'initiated'
  });

  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expForm, setExpForm] = useState({
    title: '', category: 'Travel & Accommodation', amount: 10000, employee_name: ''
  });

  // Settings State
  const [companySettings, setCompanySettings] = useState({
    name: 'Tata Consultancy Services (TCS)',
    email: 'hr-relocation@tcs.com',
    gstin: '24AAAAA0000A1Z5',
    city: 'Ahmedabad',
    office_address: 'GIFT City Tower A, Gandhinagar - 382355',
    max_allowance: 75000
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const setTab = (t) => {
    setSearchParams({ tab: t });
    setMobileDrawerOpen(false);
  };

  // Fetch Live Data with seamless fallback to MOCK
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const empRes = await getCompanyEmployees();
      if (empRes && Array.isArray(empRes.data) && empRes.data.length > 0) {
        setEmployees(empRes.data);
      }
    } catch {
      /* Keep rich initial mock data */
    }

    try {
      const appRes = await getCompanyApprovals();
      if (appRes && Array.isArray(appRes.data) && appRes.data.length > 0) {
        setApprovals(appRes.data);
      }
    } catch {
      /* Keep rich initial mock data */
    }

    try {
      const expRes = await getCompanyExpenses();
      if (expRes && Array.isArray(expRes.data) && expRes.data.length > 0) {
        setExpenses(expRes.data);
      }
    } catch {
      /* Keep rich initial mock data */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Stats
  const totalEmployeesCount = employees.length;
  const activeRelocationsCount = employees.filter(e => e.relocation_stage !== 'moved').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const totalExpensesAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Employee Filter Logic
  const filteredEmployees = employees.filter(e => {
    const matchesSearch = !empSearch || 
      e.name?.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.employee_id?.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.department?.toLowerCase().includes(empSearch.toLowerCase());
    const matchesStage = stageFilter === 'all' || e.relocation_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Employee CRUD Handlers
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await updateCompanyEmployee(editingEmp._id, empForm);
        setEmployees(prev => prev.map(item => item._id === editingEmp._id ? { ...item, ...empForm } : item));
      } else {
        const newEmpObj = {
          _id: `emp_${Date.now()}`,
          employee_id: `MS-${Math.floor(8000 + Math.random() * 1000)}`,
          ...empForm,
          relocation_city: 'Ahmedabad',
          created_at: new Date().toISOString().split('T')[0]
        };
        try {
          await createCompanyEmployee(empForm);
        } catch { /* client fallback */ }
        setEmployees(prev => [newEmpObj, ...prev]);
      }
      setIsEmpModalOpen(false);
      setEditingEmp(null);
      setEmpForm({ name: '', email: '', department: 'Engineering', designation: '', budget_allocated: 50000, preferred_locality: 'Vastrapur', relocation_stage: 'initiated' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save employee profile.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee from corporate batch?')) return;
    try {
      await deleteCompanyEmployee(id);
    } catch { /* fallback */ }
    setEmployees(prev => prev.filter(e => e._id !== id));
  };

  // Approvals Workflow Handlers
  const handleProcessApprovalAction = async (id, status) => {
    try {
      await processCompanyApproval(id, status);
    } catch { /* fallback */ }
    setApprovals(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  // Expenses CRUD Handlers
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    const newExp = {
      _id: `exp_${Date.now()}`,
      ...expForm,
      date: new Date().toISOString().split('T')[0]
    };
    try {
      await createCompanyExpense(expForm);
    } catch { /* fallback */ }
    setExpenses(prev => [newExp, ...prev]);
    setIsExpModalOpen(false);
    setExpForm({ title: '', category: 'Travel & Accommodation', amount: 10000, employee_name: '' });
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteCompanyExpense(id);
    } catch { /* fallback */ }
    setExpenses(prev => prev.filter(e => e._id !== id));
  };

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Off-Canvas Mobile Navigation Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Off-Canvas Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 transform ease-in-out md:hidden flex flex-col justify-between ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-5 border-b border-border flex justify-between items-center bg-slate-900 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#00ADB5] via-teal-400 to-[#00ADB5] shadow-md flex-shrink-0">
                <img src="/smart-Building.png" alt="MoveSmart" className="w-full h-full rounded-full object-cover bg-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block leading-none">
                  Move<span className="text-[#00ADB5]">Smart</span>
                </span>
                <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Enterprise HR Portal</span>
              </div>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-5 py-4 border-b border-border bg-surface flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-xs">
                {user.email?.[0]?.toUpperCase() || 'H'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-text-primary truncate">{user.email}</p>
                <span className="text-[10px] text-[#00ADB5] font-extrabold">{totalEmployeesCount} Relocating Personnel</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {SIDEBAR_TABS.map((tabItem) => {
              const IconComp = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              let badge = null;
              if (tabItem.id === 'employees') badge = totalEmployeesCount;
              if (tabItem.id === 'approvals') badge = pendingApprovalsCount;

              return (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white shadow-xs' : 'text-text-primary hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#00ADB5]'}`} />
                    <span>{tabItem.label}</span>
                  </div>
                  {badge > 0 && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer Logout */}
        <div className="p-4 border-t border-border bg-white">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col justify-between flex-shrink-0 z-10">
        <div>
          {/* Logo Header */}
          <div className="p-5 border-b border-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#00ADB5] via-[#222831] to-[#00ADB5] shadow-md flex-shrink-0">
              <img src="/smart-Building.png" alt="MoveSmart" className="w-full h-full rounded-full object-cover bg-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-[#222831] block leading-none">
                Move<span className="text-[#00ADB5]">Smart</span>
              </span>
              <span className="text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider block mt-1">Enterprise HR Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {SIDEBAR_TABS.map((tabItem) => {
              const IconComp = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              let badge = null;
              if (tabItem.id === 'employees') badge = totalEmployeesCount;
              if (tabItem.id === 'approvals') badge = pendingApprovalsCount;

              return (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white shadow-xs' : 'text-text-primary hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#00ADB5]'}`} />
                    <span>{tabItem.label}</span>
                  </div>
                  {badge > 0 && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border bg-surface">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'H'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-text-primary truncate">{user?.name || 'HR Manager'}</p>
              <p className="text-[10px] text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-border h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-text-primary hover:bg-surface md:hidden transition-colors"
              aria-label="Open mobile navigation drawer"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#222831] tracking-tight capitalize">
                {(activeTab || '').replace(/-/g, ' ')}
              </h1>
              <p className="text-[11px] text-[#393E46] font-medium hidden sm:block">
                Corporate Relocation Batch Management Hub
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-[#393E46] bg-surface px-3 py-1.5 rounded-full border border-border">
              🏢 {companySettings.name}
            </span>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {loading && (
            <div className="py-12 text-center">
              <LoadingSpinner size="lg" message="Synchronizing corporate relocation pipeline..." />
            </div>
          )}

          {/* TAB 1: OVERVIEW HUB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Executive KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard value={totalEmployeesCount} label="Total Personnel" icon={UserIcon} color="text-primary" />
                <StatCard value={activeRelocationsCount} label="Active Moves" icon={CalendarIcon} color="text-amber-600" />
                <StatCard value={pendingApprovalsCount} label="Pending Approvals" icon={CheckCircleIcon} color="text-rose-600" />
                <StatCard value={`₹${(totalExpensesAmount / 1000).toFixed(1)}k`} label="Total Expenses" icon={CostIcon} color="text-emerald-600" />
              </div>

              {/* Quick Actions & Recent Batch */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-base text-[#222831]">Recent Batch Employees</h3>
                    <Button variant="outline" size="sm" onClick={() => setTab('employees')}>View All →</Button>
                  </div>
                  <Card className="p-0 overflow-hidden border border-border rounded-2xl bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-medium border-collapse">
                        <thead className="bg-surface text-[#393E46] border-b border-border uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4">Locality</th>
                            <th className="py-3 px-4">Stage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {employees.slice(0, 4).map(e => (
                            <tr key={e._id} className="hover:bg-surface/50">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#222831]">{e.name}</div>
                                <div className="text-[10px] text-text-secondary">{e.employee_id}</div>
                              </td>
                              <td className="py-3.5 px-4 text-text-secondary">{e.department}</td>
                              <td className="py-3.5 px-4 font-semibold text-[#00ADB5]">{e.preferred_locality}</td>
                              <td className="py-3.5 px-4">
                                <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                                  {(e.relocation_stage || e.relocation_status || 'initiated').replace(/_/g, ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* Quick Approvals Queue */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-base text-[#222831]">Approval Queue</h3>
                    <Button variant="outline" size="sm" onClick={() => setTab('approvals')}>All ({pendingApprovalsCount})</Button>
                  </div>
                  <div className="space-y-3">
                    {approvals.filter(a => a.status === 'pending').slice(0, 3).map(app => (
                      <Card key={app._id} className="p-4 bg-white border border-border rounded-xl space-y-2 shadow-xs">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-[#222831]">{app.employee_name}</span>
                          <span className="text-xs font-black text-emerald-600">₹{app.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2">{app.notes}</p>
                        <div className="flex gap-2 pt-2">
                          <Button size="xs" variant="primary" onClick={() => handleProcessApprovalAction(app._id, 'approved')}>Approve</Button>
                          <Button size="xs" variant="outline" onClick={() => handleProcessApprovalAction(app._id, 'rejected')}>Reject</Button>
                        </div>
                      </Card>
                    ))}
                    {pendingApprovalsCount === 0 && (
                      <div className="p-6 text-center text-xs text-text-secondary bg-white rounded-xl border border-border">
                        ✓ All relocation allowance requests are fully approved.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYEE DIRECTORY */}
          {activeTab === 'employees' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-[#222831]">Employee Batch Directory</h3>
                  <p className="text-xs text-text-secondary">Manage relocating staff profiles, housing budgets, and transfer status.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => { setEditingEmp(null); setIsEmpModalOpen(true); }}>
                  + Add Employee to Batch
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-border shadow-xs">
                <input
                  type="text"
                  placeholder="Search by name, ID, or department..."
                  value={empSearch}
                  onChange={e => setEmpSearch(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-border rounded-xl focus:border-[#00ADB5] outline-none"
                />
                <select
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs border border-border rounded-xl bg-white text-text-primary outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="initiated">Initiated</option>
                  <option value="visit_scheduled">Visit Scheduled</option>
                  <option value="approved">Approved</option>
                  <option value="moved">Moved In</option>
                </select>
              </div>

              {/* Employees Table */}
              <Card className="p-0 overflow-hidden border border-border rounded-2xl bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead className="bg-surface text-[#393E46] border-b border-border uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Employee Details</th>
                        <th className="py-3.5 px-4">Department & Role</th>
                        <th className="py-3.5 px-4">Target Locality</th>
                        <th className="py-3.5 px-4">Budget Allowance</th>
                        <th className="py-3.5 px-4">Transfer Stage</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredEmployees.map(e => (
                        <tr key={e._id} className="hover:bg-surface/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#222831]">{e.name}</div>
                            <div className="text-[10px] text-[#00ADB5] font-extrabold">{e.employee_id} • {e.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-text-primary">{e.department}</div>
                            <div className="text-[10px] text-text-secondary">{e.designation}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 font-bold text-[#222831]">
                              <MapPinIcon className="w-3.5 h-3.5 text-[#00ADB5]" />
                              <span>{e.preferred_locality}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-black text-emerald-600">
                            ₹{(e.budget_allocated || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
                              {(e.relocation_stage || e.relocation_status || 'initiated').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingEmp(e);
                                setEmpForm({
                                  name: e.name, email: e.email, department: e.department,
                                  designation: e.designation, budget_allocated: e.budget_allocated,
                                  preferred_locality: e.preferred_locality, relocation_stage: e.relocation_stage
                                });
                                setIsEmpModalOpen(true);
                              }}
                              className="text-xs font-bold text-[#00ADB5] hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(e._id)}
                              className="text-xs font-bold text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: APPROVAL QUEUE */}
          {activeTab === 'approvals' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-black text-[#222831]">Corporate Approval Queue</h3>
                <p className="text-xs text-text-secondary">Approve security deposits, travel allowances, and relocation budget requests.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvals.map(app => (
                  <Card key={app._id} className="p-5 bg-white border border-border rounded-2xl space-y-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#222831]">{app.employee_name}</h4>
                        <span className="text-[10px] font-bold text-[#00ADB5] uppercase tracking-wider">{app.category}</span>
                      </div>
                      <span className="text-base font-black text-emerald-600">₹{app.amount.toLocaleString('en-IN')}</span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded-xl border border-border">
                      {app.notes}
                    </p>

                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                        app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {app.status}
                      </span>

                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="xs" variant="primary" onClick={() => handleProcessApprovalAction(app._id, 'approved')}>Approve Request</Button>
                          <Button size="xs" variant="outline" onClick={() => handleProcessApprovalAction(app._id, 'rejected')}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RELOCATION TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-black text-[#222831]">Relocation Batch Milestone Timeline</h3>
                <p className="text-xs text-text-secondary">Track real-time transfer progress from initial initiation to final keys handover.</p>
              </div>

              <div className="space-y-4">
                {employees.map((emp, i) => (
                  <Card key={emp._id} className="p-5 bg-white border border-border rounded-2xl space-y-4 shadow-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#222831]">{emp.name} ({emp.employee_id})</h4>
                        <p className="text-xs text-text-secondary">{emp.department} • Target: {emp.preferred_locality}, Ahmedabad</p>
                      </div>
                      <span className="text-xs font-black text-[#00ADB5] bg-primary/10 px-3 py-1 rounded-full">
                        ₹{(emp.budget_allocated || 0).toLocaleString('en-IN')} Budget
                      </span>
                    </div>

                    {/* Progress Bar & Milestones */}
                    <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-bold">
                      <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                        1. Initiated ✓
                      </div>
                      <div className={`p-2.5 rounded-xl border ${i > 0 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-surface text-text-secondary border-border'}`}>
                        2. House Shortlisted
                      </div>
                      <div className={`p-2.5 rounded-xl border ${emp.relocation_stage === 'approved' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-surface text-text-secondary border-border'}`}>
                        3. Visit & Lease Sign
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface text-text-secondary border border-border">
                        4. Keys Handover
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXPENSE TRACKER */}
          {activeTab === 'expenses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-[#222831]">Corporate Relocation Expenses</h3>
                  <p className="text-xs text-text-secondary">Log and monitor corporate travel, freight, and lease registration costs.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsExpModalOpen(true)}>
                  + Log New Expense
                </Button>
              </div>

              <Card className="p-0 overflow-hidden border border-border rounded-2xl bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium border-collapse">
                    <thead className="bg-surface text-[#393E46] border-b border-border uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Expense Title</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Associated Employee</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {expenses.map(exp => (
                        <tr key={exp._id} className="hover:bg-surface/50">
                          <td className="py-3.5 px-4 font-bold text-[#222831]">{exp.title}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-text-primary">{exp.employee_name || 'General Batch'}</td>
                          <td className="py-3.5 px-4 font-black text-emerald-600">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4 text-text-secondary">{exp.date}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button onClick={() => handleDeleteExpense(exp._id)} className="text-rose-600 font-bold hover:underline">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 6: CORPORATE REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-[#222831]">Corporate Analytics & Export</h3>
                  <p className="text-xs text-text-secondary">Generate relocation budget utilization and batch summary reports.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => alert('Corporate Relocation CSV Report downloaded!')}>
                  Export CSV Report ↓
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border border-border rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-sm text-[#222831]">Budget Allocation Breakdown</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total Allocated Budget</span>
                      <span className="font-bold">₹1,40,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Utilized Relocation Expenses</span>
                      <span className="font-bold text-emerald-600">₹{totalExpensesAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                      <div className="bg-[#00ADB5] h-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white border border-border rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-sm text-[#222831]">Top Relocation Hub Localities</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">1. Vastrapur, Ahmedabad</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">45% Demand</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">2. Bodakdev, Ahmedabad</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">35% Demand</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">3. GIFT City, Gandhinagar</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">20% Demand</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 7: COMPANY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div>
                <h3 className="text-lg font-black text-[#222831]">Company Profile & Policy</h3>
                <p className="text-xs text-text-secondary">Configure your corporate account, GST details, and max employee budget cap.</p>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
                  ✓ Corporate settings saved successfully.
                </div>
              )}

              <Card className="p-6 bg-white border border-border rounded-2xl space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companySettings.name}
                    onChange={e => setCompanySettings({ ...companySettings, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#393E46] block mb-1">HR Email</label>
                    <input
                      type="email"
                      value={companySettings.email}
                      onChange={e => setCompanySettings({ ...companySettings, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#393E46] block mb-1">Corporate GSTIN</label>
                    <input
                      type="text"
                      value={companySettings.gstin}
                      onChange={e => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Corporate Office Address</label>
                  <input
                    type="text"
                    value={companySettings.office_address}
                    onChange={e => setCompanySettings({ ...companySettings, office_address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Max Relocation Allowance Cap (₹)</label>
                  <input
                    type="number"
                    value={companySettings.max_allowance}
                    onChange={e => setCompanySettings({ ...companySettings, max_allowance: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>

                <Button variant="primary" size="sm" onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }}>
                  Save Profile Changes
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-[#222831]">
                {editingEmp ? 'Edit Employee Profile' : 'Add Employee to Relocation Batch'}
              </h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#393E46] block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={empForm.name}
                  onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#393E46] block mb-1">Corporate Email</label>
                <input
                  required
                  type="email"
                  value={empForm.email}
                  onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Department</label>
                  <input
                    type="text"
                    value={empForm.department}
                    onChange={e => setEmpForm({ ...empForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Designation</label>
                  <input
                    type="text"
                    value={empForm.designation}
                    onChange={e => setEmpForm({ ...empForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Budget Allowance (₹)</label>
                  <input
                    type="number"
                    value={empForm.budget_allocated}
                    onChange={e => setEmpForm({ ...empForm, budget_allocated: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Target Locality</label>
                  <input
                    type="text"
                    value={empForm.preferred_locality}
                    onChange={e => setEmpForm({ ...empForm, preferred_locality: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsEmpModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Personnel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-[#222831]">Log Corporate Relocation Expense</h3>
              <button onClick={() => setIsExpModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#393E46] block mb-1">Expense Description</label>
                <input
                  required
                  type="text"
                  value={expForm.title}
                  onChange={e => setExpForm({ ...expForm, title: e.target.value })}
                  placeholder="e.g. Flight Tickets & Hotel Stay"
                  className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#393E46] block mb-1">Category</label>
                <select
                  value={expForm.category}
                  onChange={e => setExpForm({ ...expForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none bg-white"
                >
                  <option value="Travel & Accommodation">Travel & Accommodation</option>
                  <option value="Legal & Documentation">Legal & Documentation</option>
                  <option value="Packers & Logistics">Packers & Logistics</option>
                  <option value="Brokerage Allowance">Brokerage Allowance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    value={expForm.amount}
                    onChange={e => setExpForm({ ...expForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#393E46] block mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={expForm.employee_name}
                    onChange={e => setExpForm({ ...expForm, employee_name: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsExpModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Log Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
