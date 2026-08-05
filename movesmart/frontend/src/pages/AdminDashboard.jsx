// src/pages/AdminDashboard.jsx — Master Super Admin Platform Portal (PRD §6.5, Architecture.md §4.5, Phase 14)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// API Clients
import { getAdminDashboard } from '../api/adminDashboard';
import { exportAdminAnalyticsCSV } from '../api/analytics';

// Admin Components
import AdminKPICards from '../components/admin/AdminKPICards';
import UserManagementTable from '../components/admin/UserManagementTable';
import PropertyModerationPanel from '../components/admin/PropertyModerationPanel';
import BrokerManagementPanel from '../components/admin/BrokerManagementPanel';
import CompanyManagementPanel from '../components/admin/CompanyManagementPanel';
import AIMLMonitoringPanel from '../components/admin/AIMLMonitoringPanel';
import CMSContentEditor from '../components/admin/CMSContentEditor';
import PlatformSettingsForm from '../components/admin/PlatformSettingsForm';
import FeedbackManager from '../components/admin/FeedbackManager';
import ActivityFeed from '../components/crm/ActivityFeed';

// Common Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboard();
      setSummaryData(res.data || res);
    } catch {
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#EEEEEE] font-sans text-[#222831] overflow-hidden">
      {/* Super Admin Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#D9D9D9] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <div className="p-6 border-b border-[#D9D9D9] flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart</span>
              <span className="block text-[9px] font-extrabold text-red-600 uppercase tracking-wider">Super Admin Platform</span>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {[
              { id: 'overview', label: 'Admin Overview', icon: '📊' },
              { id: 'users', label: 'User Registry', icon: '👥' },
              { id: 'moderation', label: 'Property Moderation', icon: '🏠' },
              { id: 'brokers', label: 'Broker Directory', icon: '🤝' },
              { id: 'companies', label: 'HR Companies', icon: '🏢' },
              { id: 'ai-ml', label: 'AI & ML Health', icon: '🤖' },
              { id: 'analytics', label: 'Platform Analytics', icon: '📈' },
              { id: 'cms', label: 'CMS Manager', icon: '📝' },
              { id: 'settings', label: 'Platform Settings', icon: '⚙️' },
              { id: 'feedback', label: 'Feedback Center', icon: '💬' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive ? 'bg-[#393E46] text-white shadow-sm' : 'text-[#393E46] hover:bg-[#EEEEEE]'
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
            <span>Logout Admin</span>
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
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-red-100 border border-red-200 rounded-full text-red-700 uppercase">
              Super Admin Console
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold text-[#393E46]">
            <span>Super Admin: <strong>{user?.email || 'admin@movesmart.com'}</strong></span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#EEEEEE]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <AdminKPICards summary={summaryData} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <ActivityFeed activities={summaryData?.recent_activity} />
                </div>

                <div className="space-y-4">
                  <Card className="p-5 bg-white border border-[#D9D9D9] space-y-3">
                    <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider border-b border-[#D9D9D9] pb-2">
                      Admin Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <Button variant="primary" size="sm" className="w-full justify-start" onClick={() => setActiveTab('moderation')}>
                        🏠 Review Pending Listings
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setActiveTab('users')}>
                        👥 Manage User Registry
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={exportAdminAnalyticsCSV}>
                        📥 Download Analytics CSV
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setActiveTab('settings')}>
                        ⚙️ Global Settings
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER REGISTRY */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <UserManagementTable />
            </div>
          )}

          {/* TAB 3: PROPERTY MODERATION */}
          {activeTab === 'moderation' && (
            <div className="space-y-6 animate-fade-in">
              <PropertyModerationPanel />
            </div>
          )}

          {/* TAB 4: BROKER DIRECTORY */}
          {activeTab === 'brokers' && (
            <div className="space-y-6 animate-fade-in">
              <BrokerManagementPanel />
            </div>
          )}

          {/* TAB 5: HR COMPANIES */}
          {activeTab === 'companies' && (
            <div className="space-y-6 animate-fade-in">
              <CompanyManagementPanel />
            </div>
          )}

          {/* TAB 6: AI & ML HEALTH */}
          {activeTab === 'ai-ml' && (
            <div className="space-y-6 animate-fade-in">
              <AIMLMonitoringPanel />
            </div>
          )}

          {/* TAB 7: PLATFORM ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-[#D9D9D9]">
                <div>
                  <h3 className="font-extrabold text-base text-[#222831]">Platform Growth & Analytics</h3>
                  <p className="text-xs text-[#393E46]">Ecosystem analytics for users, properties, and locality demand.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={exportAdminAnalyticsCSV}>
                  📥 Export CSV Analytics
                </Button>
              </div>

              <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
                <h4 className="font-bold text-sm text-[#222831]">Operational Metrics Summary</h4>
                <pre className="bg-[#EEEEEE] p-4 rounded-lg text-xs font-mono text-[#222831] overflow-x-auto max-h-96">
                  {JSON.stringify(summaryData, null, 2)}
                </pre>
              </Card>
            </div>
          )}

          {/* TAB 8: CMS MANAGER */}
          {activeTab === 'cms' && (
            <div className="space-y-6 animate-fade-in">
              <CMSContentEditor />
            </div>
          )}

          {/* TAB 9: PLATFORM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <PlatformSettingsForm />
            </div>
          )}

          {/* TAB 10: FEEDBACK CENTER */}
          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fade-in">
              <FeedbackManager />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
