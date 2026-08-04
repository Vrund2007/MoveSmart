// src/pages/CompanyDashboard.jsx
// Premium responsive React + Tailwind CSS dashboard for MoveSmart HR Teams.
// Light Theme, premium corporate layout, custom SVG trackers, and sidebar navigation.

import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LISTINGS } from '../utils/mockData';

export default function CompanyDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active sub-page tab selection
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Corporate budget tracker states
  const totalBudget = 300000;
  
  // Relocating employees list state
  const [employees, setEmployees] = useState([
    { id: 'emp-1', name: 'Ayush Sharma', city: 'Ahmedabad', bhkPref: 3, budget: 35000, familySize: 1, broker: 'Amit Trivedi', status: 'approved', allocation: 'lst-1', step: 3 },
    { id: 'emp-2', name: 'Vrund Patel', city: 'Ahmedabad', bhkPref: 2, budget: 25000, familySize: 2, broker: 'Amit Trivedi', status: 'approved', allocation: 'lst-3', step: 4 },
    { id: 'emp-3', name: 'Aarav Mehta', city: 'Ahmedabad', bhkPref: 3, budget: 40000, familySize: 3, broker: 'Unassigned', status: 'pending', allocation: 'unassigned', step: 2 },
    { id: 'emp-4', name: 'Sneha Vyas', city: 'Ahmedabad', bhkPref: 2, budget: 20000, familySize: 1, broker: 'Unassigned', status: 'pending', allocation: 'unassigned', step: 1 }
  ]);

  // Selected employee for detailed profile tab
  const [selectedEmpId, setSelectedEmpId] = useState('emp-1');

  // Calculate spent budget based on actual allocations
  const spentBudget = employees.reduce((sum, emp) => {
    if (emp.allocation === 'unassigned') return sum;
    const listing = LISTINGS.find((l) => l.id === emp.allocation);
    return sum + (listing ? listing.price : 0);
  }, 0);

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
            <span className="text-2xl" role="img" aria-label="Logo">👔</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-bold text-[#00ADB5] uppercase tracking-wider">Corporate HR Portal</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'HR Overview', icon: '📊' },
              { id: 'employees', label: 'Employee List', icon: '👥' },
              { id: 'details', label: 'Employee Details', icon: '👤' },
              { id: 'assign-broker', label: 'Assign Broker', icon: '🤝' },
              { id: 'suggestions', label: 'Housing Options', icon: '🏠' },
              { id: 'approvals', label: 'Approval Workflow', icon: '✓' },
              { id: 'timeline', label: 'Relocation Timeline', icon: '📅' },
              { id: 'expenses', label: 'Expense Tracker', icon: '💵' },
              { id: 'reports', label: 'Corporate Reports', icon: '📈' },
              { id: 'profile', label: 'Company Settings', icon: '🏢' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'details' && !selectedEmpId) return;
                    setActiveTab(tab.id);
                  }}
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
            Corporate HR Coordinator
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {activeTab === 'overview' && (
            <OverviewView 
              employees={employees} 
              spentBudget={spentBudget} 
              totalBudget={totalBudget} 
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'employees' && (
            <EmployeesView 
              employees={employees} 
              setSelectedEmpId={setSelectedEmpId} 
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'details' && (
            <DetailsView 
              empId={selectedEmpId} 
              employees={employees} 
              setEmployees={setEmployees}
            />
          )}
          {activeTab === 'assign-broker' && (
            <AssignBrokerView 
              employees={employees} 
              setEmployees={setEmployees}
            />
          )}
          {activeTab === 'suggestions' && <SuggestionsView />}
          {activeTab === 'approvals' && (
            <ApprovalsView 
              employees={employees} 
              setEmployees={setEmployees}
            />
          )}
          {activeTab === 'timeline' && <TimelineView employees={employees} />}
          {activeTab === 'expenses' && <ExpensesView spentBudget={spentBudget} />}
          {activeTab === 'reports' && <ReportsView spentBudget={spentBudget} totalBudget={totalBudget} />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUB-VIEWS
───────────────────────────────────────────────────────────── */

function OverviewView({ employees, spentBudget, totalBudget, setActiveTab }) {
  const activeRelocations = employees.filter(e => e.status === 'approved').length;
  const pendingApprovals = employees.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold text-[#222831]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#393E46] uppercase">Employees Relocating</span>
          <div className="text-3xl font-extrabold mt-1 tabular-nums">{employees.length}</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#393E46] uppercase">Active Relocations</span>
          <div className="text-3xl font-extrabold mt-1 text-[#00ADB5] tabular-nums">{activeRelocations}</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#F59E0B] uppercase">Pending Approvals</span>
          <div className="text-3xl font-extrabold mt-1 text-[#F59E0B] tabular-nums">{pendingApprovals}</div>
        </div>
        <div className="bg-white border border-[#D9D9D9] p-5 rounded-xl">
          <span className="text-[10px] text-[#393E46] uppercase">Spent Relocation Budget</span>
          <div className="text-3xl font-extrabold mt-1 text-[#22C55E] tabular-nums">₹{spentBudget.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider">Corporate Budget Allotment</h3>
        <div className="w-full bg-[#EEEEEE] h-3 rounded-full overflow-hidden">
          <div 
            className="bg-[#00ADB5] h-3 rounded-full transition-all duration-300"
            style={{ width: `${(spentBudget / totalBudget) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#393E46] font-bold">
          <span>₹{spentBudget.toLocaleString('en-IN')} Spent</span>
          <span>₹{(totalBudget - spentBudget).toLocaleString('en-IN')} Remaining</span>
        </div>
      </div>
    </div>
  );
}

function EmployeesView({ employees, setSelectedEmpId, setActiveTab }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Staff Relocation Roster</h3>
      <div className="overflow-x-auto border border-[#D9D9D9] rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
              <th className="p-4">Employee</th>
              <th className="p-4">Target Office</th>
              <th className="p-4">Budget Range</th>
              <th className="p-4">Assigned Broker</th>
              <th className="p-4">Relocation State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEEEEE] text-[#222831] font-semibold">
            {employees.map((emp) => (
              <tr 
                key={emp.id} 
                onClick={() => { setSelectedEmpId(emp.id); setActiveTab('details'); }}
                className="hover:bg-[#EEEEEE]/20 transition-colors cursor-pointer"
              >
                <td className="p-4 font-bold">{emp.name}</td>
                <td className="p-4 uppercase text-[#00ADB5]">{emp.city}</td>
                <td className="p-4 tabular-nums">₹{emp.budget.toLocaleString('en-IN')}/mo</td>
                <td className="p-4 text-[#393E46]">{emp.broker}</td>
                <td className="p-4">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    emp.status === 'approved' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                  }`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailsView({ empId, employees, setEmployees }) {
  const emp = employees.find(e => e.id === empId) || employees[0];
  if (!emp) return <div className="text-xs text-[#393E46]">Select an employee to view details.</div>;

  return (
    <div className="max-w-xl mx-auto bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-6 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[#EEEEEE] pb-2">Employee Relocation profile</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[9px] text-[#393E46] uppercase">Employee Name</span>
          <div className="text-sm font-bold mt-0.5">{emp.name}</div>
        </div>
        <div>
          <span className="block text-[9px] text-[#393E46] uppercase">Preferred City Location</span>
          <div className="text-sm font-bold mt-0.5">{emp.city}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[9px] text-[#393E46] uppercase">Monthly Housing Budget</span>
          <div className="text-sm font-bold mt-0.5 tabular-nums">₹{emp.budget.toLocaleString('en-IN')}/mo</div>
        </div>
        <div>
          <span className="block text-[9px] text-[#393E46] uppercase">Family Size Sizing</span>
          <div className="text-sm font-bold mt-0.5">{emp.familySize} Members</div>
        </div>
      </div>

      <div>
        <span className="block text-[9px] text-[#393E46] uppercase">Assigned Broker Agent</span>
        <div className="text-sm font-bold mt-0.5 text-[#00ADB5]">{emp.broker}</div>
      </div>
    </div>
  );
}

function AssignBrokerView({ employees, setEmployees }) {
  const handleAssign = (empId, brokerName) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, broker: brokerName } : e));
  };

  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Broker Allocation Portal</h3>
      <div className="space-y-4 font-semibold text-[#222831]">
        {employees.map((emp) => (
          <div key={emp.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
            <div>
              <strong>{emp.name}</strong>
              <span className="block text-[10px] text-[#393E46] mt-0.5">Budget Target: ₹{emp.budget.toLocaleString('en-IN')}</span>
            </div>
            <select
              value={emp.broker}
              onChange={(e) => handleAssign(emp.id, e.target.value)}
              className="border border-[#D9D9D9] rounded-lg p-2 bg-white text-xs font-semibold focus:outline-none"
            >
              <option value="Unassigned">Select Broker...</option>
              <option value="Amit Trivedi">Amit Trivedi (Ahmedabad)</option>
              <option value="Rohan Shah">Rohan Shah (Ahmedabad)</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestionsView() {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Suggested Listings Matrix</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LISTINGS.slice(0, 4).map((p) => (
          <div key={p.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
            <div>
              <strong className="block text-[#222831]">{p.title}</strong>
              <span className="text-[10px] text-[#00ADB5] uppercase">{p.locality}</span>
            </div>
            <span className="font-bold text-[#222831] tabular-nums">₹{p.price.toLocaleString('en-IN')}/mo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalsView({ employees, setEmployees }) {
  const handleApproval = (id, status) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Approval Workflow Board</h3>
      <div className="space-y-4">
        {employees.map((emp) => (
          <div key={emp.id} className="border border-[#D9D9D9] p-4 rounded-lg bg-[#EEEEEE]/40 flex justify-between items-center">
            <div>
              <strong>{emp.name}</strong>
              <span className="block text-[10px] text-[#393E46] mt-0.5">Status: {emp.status.toUpperCase()}</span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleApproval(emp.id, 'approved')}
                className="bg-[#22C55E] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproval(emp.id, 'rejected')}
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

function TimelineView({ employees }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Active Relocation Step Progress</h3>
      <div className="space-y-6">
        {employees.map((emp) => (
          <div key={emp.id} className="border-l-2 border-[#00ADB5] pl-4 space-y-2">
            <strong>{emp.name}</strong>
            <div className="flex space-x-6 text-[10px] text-[#393E46] font-bold">
              <span className={emp.step >= 1 ? 'text-[#00ADB5]' : ''}>1. Intake Onboarding</span>
              <span className={emp.step >= 2 ? 'text-[#00ADB5]' : ''}>2. Searching Housing</span>
              <span className={emp.step >= 3 ? 'text-[#00ADB5]' : ''}>3. HR Approval</span>
              <span className={emp.step >= 4 ? 'text-[#00ADB5]' : ''}>4. Logistical Transit</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpensesView({ spentBudget }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider">Expenditure Audits</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-[#EEEEEE] pb-2">
          <span>Broker Commission Fees</span>
          <span className="tabular-nums">₹24,000</span>
        </div>
        <div className="flex justify-between items-center border-b border-[#EEEEEE] pb-2">
          <span>Assigned Housing Lease Deposits</span>
          <span className="tabular-nums font-bold">₹{spentBudget.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ spentBudget, totalBudget }) {
  return (
    <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm text-center py-12 animate-fade-in">
      <span className="text-2xl">📈</span>
      <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider mt-2">Export Corporate Performance Reports</h3>
      <p className="text-xs text-[#393E46] mt-1">Available export formats: PDF, CSV. Current budget usage is at {((spentBudget / totalBudget) * 100).toFixed(0)}%.</p>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="max-w-md mx-auto bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs font-semibold text-[#222831]">
      <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[#EEEEEE] pb-2">Corporate Office Settings</h3>
      <div>
        <span className="block text-[9px] text-[#393E46] uppercase">Company Account Domain</span>
        <div className="mt-0.5">Google India Relocations Partner</div>
      </div>
    </div>
  );
}
