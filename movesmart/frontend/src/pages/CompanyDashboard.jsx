// src/pages/CompanyDashboard.jsx — Master Company HR Enterprise Portal (PRD §6.4, Architecture.md §4.4, Phase 12)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// API Clients
import { getCompanyDashboard, createCompanyProfile } from '../api/company';
import { getCompanyEmployees, createCompanyEmployee, updateCompanyEmployee, deleteCompanyEmployee } from '../api/employees';
import { getBrokerAssignments, createBrokerAssignment, updateBrokerAssignmentStatus } from '../api/brokerAssignment';
import { getCompanyApprovals, createCompanyApproval, processCompanyApproval } from '../api/approvals';
import { getCompanyExpenses, createCompanyExpense, deleteCompanyExpense } from '../api/expenses';
import { getCompanyReport, exportCompanyReportCSV, askAIEnterpriseAssistant } from '../api/companyReports';
import { getBrokerListings } from '../api/broker';

// Common Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Enterprise HR Components
import EnterpriseKPICards from '../components/company/EnterpriseKPICards';
import EmployeeCard from '../components/company/EmployeeCard';
import BrokerAssignmentCard from '../components/company/BrokerAssignmentCard';
import ApprovalCard from '../components/company/ApprovalCard';
import RelocationTimeline from '../components/company/RelocationTimeline';
import ExpenseTable from '../components/company/ExpenseTable';
import ActivityFeed from '../components/crm/ActivityFeed';

export default function CompanyDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // 1. Dashboard Overview State
  const [dashboardData, setDashboardData] = useState(null);
  const [dashLoading, setDashLoading] = useState(false);

  // 2. Employee Directory State
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [empForm, setEmpForm] = useState({
    name: '', email: '', phone: '', department: 'Engineering', designation: 'Team Member', office_location: 'Ahmedabad HQ', housing_budget: 30000, lifestyle_preference: 'quiet'
  });

  // 3. Broker Assignment State
  const [assignments, setAssignments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ broker_id: '', employee_id: '', notes: '' });
  const [brokersList, setBrokersList] = useState([]);

  // 4. Approval Center State
  const [approvals, setApprovals] = useState([]);
  const [appLoading, setAppLoading] = useState(false);

  // 5. Expense Tracker State
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({});
  const [expLoading, setExpLoading] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ employee_id: 'General', category: 'Housing', amount: '', notes: '' });

  // 6. Reports State
  const [reportType, setReportType] = useState('employees');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // 7. AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 8. Company Settings State
  const [settingsForm, setSettingsForm] = useState({
    company_name: user?.role_profile?.company_name || 'Acme Tech Solutions',
    office_locations: user?.role_profile?.office_locations?.join(', ') || 'Ahmedabad HQ, GIFT City',
    hr_contact: user?.role_profile?.hr_contact || user?.email || '',
    department: 'People Operations',
    relocation_policy: 'Standard Corporate Relocation Package (Housing Allowance + Broker Assistance)'
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch Dashboard
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true);
    try {
      const res = await getCompanyDashboard();
      setDashboardData(res.data || res);
    } catch {
      // fallback handled gracefully
    } finally {
      setDashLoading(false);
    }
  }, []);

  // Fetch Employees
  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    try {
      const res = await getCompanyEmployees();
      setEmployees(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setEmployees([]);
    } finally {
      setEmpLoading(false);
    }
  }, []);

  // Fetch Assignments & Broker list
  const fetchAssignments = useCallback(async () => {
    setAssignLoading(true);
    try {
      const res = await getBrokerAssignments();
      setAssignments(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);

      // Fetch sample brokers from listings
      const bRes = await getBrokerListings();
      setBrokersList(Array.isArray(bRes.data) ? bRes.data : []);
    } catch {
      setAssignments([]);
    } finally {
      setAssignLoading(false);
    }
  }, []);

  // Fetch Approvals
  const fetchApprovals = useCallback(async () => {
    setAppLoading(true);
    try {
      const res = await getCompanyApprovals();
      setApprovals(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setApprovals([]);
    } finally {
      setAppLoading(false);
    }
  }, []);

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    setExpLoading(true);
    try {
      const res = await getCompanyExpenses();
      const payload = res.data || res;
      setExpenses(Array.isArray(payload.expenses) ? payload.expenses : []);
      setExpenseSummary(payload.summary || {});
    } catch {
      setExpenses([]);
    } finally {
      setExpLoading(false);
    }
  }, []);

  // Fetch Corporate Report
  const fetchReport = useCallback(async (type) => {
    setReportLoading(true);
    try {
      const res = await getCompanyReport(type);
      setReportData(res.data || res);
    } catch {
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchEmployees();
    fetchAssignments();
    fetchApprovals();
    fetchExpenses();
  }, [fetchDashboard, fetchEmployees, fetchAssignments, fetchApprovals, fetchExpenses]);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReport(reportType);
    }
  }, [activeTab, reportType, fetchReport]);

  // Handlers for Employee CRUD
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEmp) {
        await updateCompanyEmployee(editingEmp._id, empForm);
      } else {
        await createCompanyEmployee(empForm);
      }
      setIsEmpModalOpen(false);
      setEditingEmp(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save employee record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Delete employee record for ${emp.name}?`)) return;
    try {
      await deleteCompanyEmployee(emp._id);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  // Handlers for Broker Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBrokerAssignment(assignForm);
      setIsAssignModalOpen(false);
      setAssignForm({ broker_id: '', employee_id: '', notes: '' });
      fetchAssignments();
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign broker.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAssignmentStatus = async (id, status) => {
    try {
      await updateBrokerAssignmentStatus(id, status);
      fetchAssignments();
    } catch {
      // ignore
    }
  };

  // Handlers for Approvals Workflow
  const handleProcessApproval = async (id, status, reason) => {
    try {
      await processCompanyApproval(id, status, reason);
      fetchApprovals();
      fetchEmployees();
    } catch {
      // ignore
    }
  };

  // Handlers for Expenses
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCompanyExpense({ ...expenseForm, amount: Number(expenseForm.amount) });
      setIsExpenseModalOpen(false);
      setExpenseForm({ employee_id: 'General', category: 'Housing', amount: '', notes: '' });
      fetchExpenses();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteCompanyExpense(id);
      fetchExpenses();
      fetchDashboard();
    } catch {
      // ignore
    }
  };

  // Handler for AI Enterprise Assistant
  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await askAIEnterpriseAssistant(aiQuery.trim());
      setAiResponse(res.data?.response || res.response || 'Enterprise summary generated.');
    } catch (err) {
      setAiResponse('Failed to process AI prompt query.');
    } finally {
      setAiLoading(false);
    }
  };

  // Handler for Company Settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const locArray = typeof settingsForm.office_locations === 'string'
        ? settingsForm.office_locations.split(',').map(s => s.trim())
        : settingsForm.office_locations;

      await createCompanyProfile({ ...settingsForm, office_locations: locArray });
      alert('Company settings updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSubmitting(false);
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
            <span className="text-2xl" role="img" aria-label="Logo">🏢</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Company HR Enterprise</span>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {[
              { id: 'overview', label: 'Enterprise Overview', icon: '📊' },
              { id: 'employees', label: `Employee Directory (${employees.length})`, icon: '👥' },
              { id: 'brokers', label: `Broker Assignments (${assignments.length})`, icon: '🤝' },
              { id: 'approvals', label: `Approval Center (${approvals.length})`, icon: '✅' },
              { id: 'timeline', label: 'Relocation Timeline', icon: '📈' },
              { id: 'expenses', label: 'Expense Tracker', icon: '💵' },
              { id: 'reports', label: 'Corporate Reports', icon: '📄' },
              { id: 'ai-assistant', label: 'AI Enterprise Assistant', icon: '🤖' },
              { id: 'settings', label: 'Company Settings', icon: '⚙️' },
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
              Corporate HR Portal
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold text-[#393E46]">
            <span>Company HR: <strong>{user?.name || 'HR Manager'}</strong></span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {/* TAB 1: ENTERPRISE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <EnterpriseKPICards widgets={widgets} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <ActivityFeed activities={dashboardData?.recent_activity} />
                </div>

                <div className="space-y-4">
                  <Card className="p-5 bg-white border border-[#D9D9D9] space-y-3">
                    <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider border-b border-[#D9D9D9] pb-2">
                      Quick Enterprise Actions
                    </h4>
                    <div className="space-y-2">
                      <Button variant="primary" size="sm" className="w-full justify-start" onClick={() => setIsEmpModalOpen(true)}>
                        + Register Employee Record
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setIsAssignModalOpen(true)}>
                        + Assign Broker Partner
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setIsExpenseModalOpen(true)}>
                        + Log Relocation Expense
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setActiveTab('ai-assistant')}>
                        🤖 Run AI Relocation Query
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYEE DIRECTORY */}
          {activeTab === 'employees' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#222831]">Enterprise Employee Directory</h3>
                  <p className="text-xs text-[#393E46]">Manage relocating workforce, housing budgets, and relocation status.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => { setEditingEmp(null); setEmpForm({ name: '', email: '', phone: '', department: 'Engineering', designation: 'Team Member', office_location: 'Ahmedabad HQ', housing_budget: 30000, lifestyle_preference: 'quiet' }); setIsEmpModalOpen(true); }}>
                  + Register Employee Record
                </Button>
              </div>

              {empLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading employee directory..." />
                </div>
              ) : employees.length === 0 ? (
                <Card className="text-center py-12 text-xs text-[#393E46]/70">
                  No employees registered. Click "+ Register Employee Record" to add employees.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employees.map((emp) => (
                    <EmployeeCard
                      key={emp._id}
                      employee={emp}
                      onEdit={(e) => {
                        setEditingEmp(e);
                        setEmpForm({
                          name: e.name, email: e.email, phone: e.phone, department: e.department,
                          designation: e.designation, office_location: e.office_location,
                          housing_budget: e.housing_budget, lifestyle_preference: e.lifestyle_preference || 'quiet'
                        });
                        setIsEmpModalOpen(true);
                      }}
                      onDelete={handleDeleteEmployee}
                      onAssignBroker={(e) => {
                        setAssignForm({ broker_id: '', employee_id: e.employee_id, notes: '' });
                        setIsAssignModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BROKER ASSIGNMENTS */}
          {activeTab === 'brokers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#222831]">Broker Assignments Manager</h3>
                  <p className="text-xs text-[#393E46]">Assign verified real estate brokers to assist relocating employees.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
                  + Assign Broker Partner
                </Button>
              </div>

              {assignLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading broker assignments..." />
                </div>
              ) : assignments.length === 0 ? (
                <Card className="text-center py-12 text-xs text-[#393E46]/70">
                  No broker assignments recorded. Click "+ Assign Broker Partner" to pair brokers with employees.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignments.map((a) => (
                    <BrokerAssignmentCard
                      key={a._id}
                      assignment={a}
                      onUpdateStatus={handleUpdateAssignmentStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: APPROVAL CENTER */}
          {activeTab === 'approvals' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#222831]">Enterprise Approval Center</h3>
                  <p className="text-xs text-[#393E46]">Review and process broker assignments, housing allocations, and budget exceptions.</p>
                </div>
              </div>

              {appLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading approval queue..." />
                </div>
              ) : approvals.length === 0 ? (
                <Card className="text-center py-12 text-xs text-[#393E46]/70">
                  No pending approval requests in queue.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvals.map((app) => (
                    <ApprovalCard
                      key={app._id}
                      approval={app}
                      onProcessApproval={handleProcessApproval}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RELOCATION TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg text-[#222831]">Workforce Relocation Milestone Timelines</h3>
              <div className="space-y-4">
                {employees.length === 0 ? (
                  <Card className="text-center py-12 text-xs text-[#393E46]/70">
                    No active employees registered to track timelines.
                  </Card>
                ) : (
                  employees.map((emp) => (
                    <RelocationTimeline
                      key={emp._id}
                      currentStatus={emp.relocation_status}
                      employeeName={`${emp.name} (${emp.department})`}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: EXPENSE TRACKER */}
          {activeTab === 'expenses' && (
            <div className="animate-fade-in">
              {expLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading relocation expense tracker..." />
                </div>
              ) : (
                <ExpenseTable
                  expenses={expenses}
                  summary={expenseSummary}
                  onLogExpense={() => setIsExpenseModalOpen(true)}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}
            </div>
          )}

          {/* TAB 7: CORPORATE REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-[#222831]">Corporate HR Relocation Reports</h3>
                  <p className="text-xs text-[#393E46]">Generate enterprise summaries and export raw CSV datasets.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="bg-white border border-[#D9D9D9] rounded p-2 text-xs font-bold text-[#222831]"
                  >
                    <option value="employees">Employee Relocation Report</option>
                    <option value="brokers">Broker Performance Report</option>
                    <option value="expenses">Expense & Budget Report</option>
                  </select>

                  <Button variant="secondary" size="sm" onClick={() => exportCompanyReportCSV(reportType)}>
                    📥 Download CSV
                  </Button>
                </div>
              </div>

              {reportLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Generating corporate report..." />
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

          {/* TAB 8: AI ENTERPRISE ASSISTANT */}
          {activeTab === 'ai-assistant' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-bold text-base text-[#222831]">AI Enterprise Assistant</h3>
                    <p className="text-xs text-[#393E46]">Ask Gemini AI for housing recommendations, relocation cost analysis, and broker performance summaries.</p>
                  </div>
                </div>

                <form onSubmit={handleAISubmit} className="space-y-3 pt-2">
                  <textarea
                    required
                    rows={3}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g. Recommend optimal housing budget allocation for 5 engineering team members near GIFT City office."
                    className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-3 text-xs text-[#222831] focus:ring-1 focus:ring-[#00ADB5]"
                  />
                  <Button type="submit" variant="primary" loading={aiLoading} className="w-full">
                    Execute Enterprise Query
                  </Button>
                </form>
              </Card>

              {aiResponse && (
                <Card className="p-6 bg-white border border-[#D9D9D9] space-y-2">
                  <h4 className="font-bold text-xs text-[#00ADB5] uppercase tracking-wider">AI Executive Answer</h4>
                  <div className="text-xs text-[#222831] whitespace-pre-wrap leading-relaxed">
                    {aiResponse}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* TAB 9: COMPANY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
              <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
                <h3 className="font-bold text-base text-[#222831] border-b border-[#D9D9D9] pb-2">
                  Company HR Profile & Settings
                </h3>

                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                  <Input
                    label="Company Name"
                    required
                    value={settingsForm.company_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, company_name: e.target.value })}
                  />

                  <Input
                    label="Office Locations (comma separated)"
                    value={settingsForm.office_locations}
                    onChange={(e) => setSettingsForm({ ...settingsForm, office_locations: e.target.value })}
                  />

                  <Input
                    label="HR Contact Email"
                    value={settingsForm.hr_contact}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hr_contact: e.target.value })}
                  />

                  <div>
                    <label className="text-xs font-semibold text-[#393E46] mb-1 block">Relocation Policy Summary</label>
                    <textarea
                      rows={3}
                      value={settingsForm.relocation_policy}
                      onChange={(e) => setSettingsForm({ ...settingsForm, relocation_policy: e.target.value })}
                      className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
                    />
                  </div>

                  <Button type="submit" variant="primary" loading={submitting} className="w-full">
                    Save Company Settings
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {/* Create / Edit Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEmployeeSubmit} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">
              {editingEmp ? 'Edit Employee Record' : 'Register New Employee'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={empForm.name}
                onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                placeholder="e.g. Vikram Verma"
              />
              <Input
                label="Email"
                type="email"
                value={empForm.email}
                onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                placeholder="e.g. vikram@acme.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department"
                value={empForm.department}
                onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
              />
              <Input
                label="Designation"
                value={empForm.designation}
                onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Office Location"
                value={empForm.office_location}
                onChange={(e) => setEmpForm({ ...empForm, office_location: e.target.value })}
              />
              <Input
                label="Monthly Housing Budget (₹)"
                type="number"
                value={empForm.housing_budget}
                onChange={(e) => setEmpForm({ ...empForm, housing_budget: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsEmpModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>
                Save Employee Record
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Broker Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssignSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">
              Assign Broker to Employee
            </h3>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Select Relocating Employee</label>
              <select
                required
                value={assignForm.employee_id}
                onChange={(e) => setAssignForm({ ...assignForm, employee_id: e.target.value })}
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              >
                <option value="">Select Employee...</option>
                {employees.map((e) => (
                  <option key={e._id} value={e.employee_id}>{e.name} ({e.employee_id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Broker Partner ID</label>
              <input
                required
                type="text"
                value={assignForm.broker_id}
                onChange={(e) => setAssignForm({ ...assignForm, broker_id: e.target.value })}
                placeholder="Enter Broker Partner User ID"
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Assignment Notes</label>
              <textarea
                rows={2}
                value={assignForm.notes}
                onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                placeholder="Notes for broker regarding housing requirements..."
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>
                Confirm Broker Assignment
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleExpenseSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">Log Relocation Expense</h3>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Category</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              >
                <option value="Housing">Housing Allowance</option>
                <option value="Broker Fee">Brokerage Fee</option>
                <option value="Transportation">Transportation & Logistics</option>
                <option value="Temporary Stay">Temporary Stay Hotel</option>
                <option value="Documentation">Documentation & Legal</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <Input
              label="Amount (₹)"
              type="number"
              required
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              placeholder="e.g. 25000"
            />

            <Input
              label="Related Employee ID (Optional)"
              value={expenseForm.employee_id}
              onChange={(e) => setExpenseForm({ ...expenseForm, employee_id: e.target.value })}
              placeholder="EMP-123 or General"
            />

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>
                Save Expense Entry
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
