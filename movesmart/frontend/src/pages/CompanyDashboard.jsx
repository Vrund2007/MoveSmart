// src/pages/CompanyDashboard.jsx — Corporate HR Portal (PRD §6.4, Architecture.md §4.4)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getRelocationBatches,
  createRelocationBatch,
  getRelocationBatchDetail,
  deleteRelocationBatch,
  addEmployeeToBatch,
  removeEmployeeFromBatch,
  searchBatchHousing,
  allocateEmployeeToListing,
  getBatchReport
} from '../api/company';
import { getListings } from '../api/listings';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StatusBadge from '../components/listings/StatusBadge';
import LocalityCard from '../components/recommendations/LocalityCard';
import ListingCard from '../components/listings/ListingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CompanyDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'batches';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // 1. Batches State
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchDetail, setBatchDetail] = useState(null);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({ batch_name: '', headcount: 5, budget: 150000, office_location: 'Vastrapur, Ahmedabad' });

  // 2. Employee State
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [empForm, setEmpForm] = useState({ employee_id: '', name: '', budget: 25000 });

  // 3. Search & Allocation State
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [approvedListings, setApprovedListings] = useState([]);
  const [allocForm, setAllocForm] = useState({ employee_id: '', listing_id: '' });

  // 4. Report State
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Fetch all batches
  const fetchBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const res = await getRelocationBatches();
      const data = res.data || res;
      const list = Array.isArray(data) ? data : [];
      setBatches(list);
      if (list.length > 0 && !selectedBatchId) {
        setSelectedBatchId(list[0]._id);
      }
    } catch {
      // ignore
    } finally {
      setBatchesLoading(false);
    }
  }, [selectedBatchId]);

  // Fetch selected batch detail
  const fetchBatchDetail = useCallback(async (bId) => {
    if (!bId) return;
    try {
      const res = await getRelocationBatchDetail(bId);
      setBatchDetail(res.data || res);
    } catch {
      // ignore
    }
  }, []);

  // Fetch approved listings for allocation dropdown
  const fetchApprovedListingsList = useCallback(async () => {
    try {
      const res = await getListings();
      const data = res.data || res;
      setApprovedListings(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchBatches();
    fetchApprovedListingsList();
  }, [fetchBatches, fetchApprovedListingsList]);

  useEffect(() => {
    if (selectedBatchId) {
      fetchBatchDetail(selectedBatchId);
    }
  }, [selectedBatchId, fetchBatchDetail]);

  // Handle Create Batch
  const handleCreateBatchSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createRelocationBatch({
        batch_name: batchForm.batch_name,
        headcount: Number(batchForm.headcount),
        budget: Number(batchForm.budget),
        office_locations: [batchForm.office_location],
        status: 'active'
      });
      const data = res.data || res;
      setIsCreateBatchOpen(false);
      setBatchForm({ batch_name: '', headcount: 5, budget: 150000, office_location: 'Vastrapur, Ahmedabad' });
      fetchBatches();
      if (data.batch_id) setSelectedBatchId(data.batch_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create relocation batch.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Employee
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    setSubmitting(true);
    try {
      await addEmployeeToBatch(selectedBatchId, {
        employee_id: empForm.employee_id,
        name: empForm.name,
        budget: Number(empForm.budget)
      });
      setIsAddEmpOpen(false);
      setEmpForm({ employee_id: '', name: '', budget: 25000 });
      fetchBatchDetail(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee to batch.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Remove Employee
  const handleRemoveEmployee = async (empId) => {
    if (!selectedBatchId) return;
    try {
      await removeEmployeeFromBatch(selectedBatchId, empId);
      fetchBatchDetail(selectedBatchId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove employee.');
    }
  };

  // Handle Bulk Housing Search
  const handleBulkSearch = async () => {
    if (!selectedBatchId) return;
    setSearchLoading(true);
    try {
      const res = await searchBatchHousing(selectedBatchId);
      setSearchResults(res.data || res);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to execute bulk housing search.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle Employee Allocation
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    setSubmitting(true);
    try {
      await allocateEmployeeToListing(selectedBatchId, {
        employee_id: allocForm.employee_id,
        listing_id: allocForm.listing_id
      });
      setAllocForm({ employee_id: '', listing_id: '' });
      fetchBatchDetail(selectedBatchId);
      alert('Employee allocated to housing successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to allocate employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Fetch Report
  const handleFetchReport = async () => {
    if (!selectedBatchId) return;
    setReportLoading(true);
    try {
      const res = await getBatchReport(selectedBatchId);
      setReportData(res.data || res);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Sidebar */}
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
              { id: 'batches', label: `Relocation Batches (${batches.length})`, icon: '📊' },
              { id: 'employees', label: 'Embedded Roster', icon: '👥' },
              { id: 'search', label: 'Bulk Housing Search', icon: '🔍' },
              { id: 'allocations', label: 'Employee Allocations', icon: '🏠' },
              { id: 'report', label: 'Relocation Reports', icon: '📈' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'report') handleFetchReport();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-[#00ADB5] text-white' : 'text-[#393E46] hover:bg-[#EEEEEE]'
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

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-[#222831] capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            {batches.length > 0 && (
              <select
                value={selectedBatchId || ''}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="bg-surface border border-border rounded px-2.5 py-1 text-xs font-bold text-text-primary"
              >
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>{b.batch_name} ({b.status})</option>
                ))}
              </select>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsCreateBatchOpen(true)}>
            + New Relocation Batch
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {/* TAB 1: Relocation Batches Overview */}
          {activeTab === 'batches' && (
            <div className="space-y-6 animate-fade-in">
              {batchDetail && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-white">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Total Batch Budget</span>
                    <div className="text-2xl font-extrabold text-text-primary mt-1 tabular-nums">
                      ₹{batchDetail.budget?.toLocaleString()}
                    </div>
                  </Card>
                  <Card className="bg-white">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Budget Used (Server Computed)</span>
                    <div className="text-2xl font-extrabold text-teal-600 mt-1 tabular-nums">
                      ₹{batchDetail.budget_used?.toLocaleString()}
                    </div>
                  </Card>
                  <Card className="bg-white">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Budget Remaining</span>
                    <div className="text-2xl font-extrabold text-primary mt-1 tabular-nums">
                      ₹{batchDetail.budget_remaining?.toLocaleString()}
                    </div>
                  </Card>
                  <Card className="bg-white">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Allocated Headcount</span>
                    <div className="text-2xl font-extrabold text-text-primary mt-1 tabular-nums">
                      {batchDetail.allocated_count || 0} / {batchDetail.headcount || 0}
                    </div>
                  </Card>
                </div>
              )}

              <h3 className="font-bold text-lg text-text-primary">Corporate Relocation Batches</h3>
              {batchesLoading ? (
                <div className="py-16 text-center">
                  <LoadingSpinner size="lg" message="Loading relocation batches..." />
                </div>
              ) : batches.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">
                  No relocation batches created. Click "+ New Relocation Batch" to start corporate onboarding.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batches.map((b) => (
                    <Card
                      key={b._id}
                      className={`cursor-pointer transition-all ${selectedBatchId === b._id ? 'border-2 border-primary shadow-md' : 'hover:border-primary'}`}
                      onClick={() => setSelectedBatchId(b._id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-base text-text-primary">{b.batch_name}</h4>
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase">{b.status}</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-3">
                        Headcount: <strong>{b.headcount}</strong> • Office: {b.office_locations?.[0] || 'N/A'}
                      </p>
                      <div className="space-y-1 text-xs border-t border-border pt-3">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Budget:</span>
                          <span className="font-bold text-text-primary">₹{b.budget?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Allocated Cost:</span>
                          <span className="font-bold text-teal-600">₹{b.budget_used?.toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Embedded Employee Roster */}
          {activeTab === 'employees' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-text-primary">Embedded Employee Roster</h3>
                <Button variant="primary" size="sm" onClick={() => setIsAddEmpOpen(true)} disabled={!selectedBatchId}>
                  + Add Employee to Batch
                </Button>
              </div>

              {!batchDetail ? (
                <Card className="text-center py-12 text-xs text-text-secondary">Select a batch above to view employees.</Card>
              ) : batchDetail.employees?.length === 0 ? (
                <Card className="text-center py-12 text-xs text-text-secondary">
                  No employees added to this relocation batch yet. Click "+ Add Employee to Batch".
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface text-[10px] font-bold text-text-secondary uppercase border-b border-border">
                        <th className="p-4">Employee ID</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Individual Rent Budget</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-semibold text-text-primary">
                      {batchDetail.employees.map((emp) => (
                        <tr key={emp.employee_id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-4 font-mono">{emp.employee_id}</td>
                          <td className="p-4 font-bold">{emp.name}</td>
                          <td className="p-4 tabular-nums">₹{emp.budget?.toLocaleString()} / mo</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleRemoveEmployee(emp.employee_id)}
                              className="text-xs font-bold text-error hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {/* TAB 3: Bulk Housing Search (Reuses Recommendation Engine) */}
          {activeTab === 'search' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border-primary">
                <div>
                  <h3 className="font-bold text-lg text-text-primary">Bulk Housing Search</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Execute bulk recommendations for batch headcount reusing the MoveSmart district scoring engine.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleBulkSearch} loading={searchLoading} className="mt-3 sm:mt-0">
                  Run Bulk Housing Search
                </Button>
              </Card>

              {searchResults && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary uppercase tracking-wider mb-3">Recommended Localities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {searchResults.recommended_localities?.map((loc, idx) => (
                        <LocalityCard key={loc.locality} item={loc} rank={idx + 1} isTop={idx === 0} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-text-primary uppercase tracking-wider mb-3">Approved Candidate Listings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {searchResults.approved_listings?.map((prop) => (
                        <ListingCard key={prop._id} listing={prop} onClick={() => navigate(`/listings/${prop._id}`)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Employee Allocations */}
          {activeTab === 'allocations' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              <Card className="space-y-4">
                <h3 className="font-bold text-lg text-text-primary">Allocate Employee to Housing</h3>
                <form onSubmit={handleAllocateSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">Select Employee</label>
                    <select
                      required
                      value={allocForm.employee_id}
                      onChange={(e) => setAllocForm({ ...allocForm, employee_id: e.target.value })}
                      className="w-full bg-surface border border-border rounded p-2.5 text-xs text-text-primary"
                    >
                      <option value="">Select an employee...</option>
                      {batchDetail?.employees?.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id}>{emp.name} ({emp.employee_id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">Select Approved Property</label>
                    <select
                      required
                      value={allocForm.listing_id}
                      onChange={(e) => setAllocForm({ ...allocForm, listing_id: e.target.value })}
                      className="w-full bg-surface border border-border rounded p-2.5 text-xs text-text-primary"
                    >
                      <option value="">Select an approved property...</option>
                      {approvedListings.map((prop) => (
                        <option key={prop._id} value={prop._id}>{prop.title} — ₹{prop.price?.toLocaleString()} ({prop.locality})</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" variant="primary" loading={submitting} className="w-full">
                    Confirm Employee Allocation
                  </Button>
                </form>
              </Card>

              {batchDetail?.allocations?.length > 0 && (
                <Card className="p-0 overflow-hidden border border-border">
                  <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider p-4 bg-surface border-b border-border">
                    Current Allocations Log
                  </h4>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface text-[10px] font-bold text-text-secondary uppercase border-b border-border">
                        <th className="p-3">Employee ID</th>
                        <th className="p-3">Listing ID</th>
                        <th className="p-3">Monthly Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-semibold text-text-primary">
                      {batchDetail.allocations.map((a, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-mono">{a.employee_id}</td>
                          <td className="p-3 font-mono">{a.listing_id}</td>
                          <td className="p-3 text-teal-600 font-bold tabular-nums">₹{a.cost?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {/* TAB 5: Relocation Report Inspector */}
          {activeTab === 'report' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-text-primary">JSON Relocation Summary Report</h3>
                <Button variant="secondary" size="sm" onClick={handleFetchReport} loading={reportLoading}>
                  Re-generate Report
                </Button>
              </div>

              {reportLoading ? (
                <div className="py-12 text-center">
                  <LoadingSpinner size="md" message="Generating corporate relocation report..." />
                </div>
              ) : reportData ? (
                <Card className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-xl overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(reportData, null, 2)}</pre>
                </Card>
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* Create Batch Modal */}
      {isCreateBatchOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateBatchSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Create Relocation Batch</h3>
            <Input
              label="Batch Name"
              required
              value={batchForm.batch_name}
              onChange={(e) => setBatchForm({ ...batchForm, batch_name: e.target.value })}
              placeholder="e.g. Q3 Tech Team Relocation"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Headcount"
                type="number"
                required
                value={batchForm.headcount}
                onChange={(e) => setBatchForm({ ...batchForm, headcount: e.target.value })}
              />
              <Input
                label="Total Budget (₹)"
                type="number"
                required
                value={batchForm.budget}
                onChange={(e) => setBatchForm({ ...batchForm, budget: e.target.value })}
              />
            </div>
            <Input
              label="Office Location"
              required
              value={batchForm.office_location}
              onChange={(e) => setBatchForm({ ...batchForm, office_location: e.target.value })}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateBatchOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>Create Batch</Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmpOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddEmployeeSubmit} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Add Employee to Batch</h3>
            <Input
              label="Employee ID (Optional)"
              value={empForm.employee_id}
              onChange={(e) => setEmpForm({ ...empForm, employee_id: e.target.value })}
              placeholder="e.g. EMP-101"
            />
            <Input
              label="Employee Name"
              required
              value={empForm.name}
              onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
              placeholder="e.g. Ayush Sharma"
            />
            <Input
              label="Individual Budget (₹)"
              type="number"
              required
              value={empForm.budget}
              onChange={(e) => setEmpForm({ ...empForm, budget: e.target.value })}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddEmpOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>Add Employee</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
