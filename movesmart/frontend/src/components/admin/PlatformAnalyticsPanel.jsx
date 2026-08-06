// src/components/admin/PlatformAnalyticsPanel.jsx — 100% Dynamic Real-Time Platform Analytics Suite (Differentiated Rent vs Sale)
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { exportAdminAnalyticsCSV } from '../../api/analytics';
import { CostIcon, UserIcon, BrowseIcon, CheckCircleIcon, MapPinIcon } from '../common/Icons';

export default function PlatformAnalyticsPanel({ summary }) {
  const [dealTypeTab, setDealTypeTab] = useState('rent'); // 'rent' or 'sale'

  const s = summary || {};
  const u = s.user_metrics || {};
  const l = s.listing_metrics || {};

  const totalUsersCount = u.total_users || 0;
  const seekersCount = u.seekers || 0;
  const ownersCount = u.owners || 0;
  const companiesCount = u.companies || 0;

  const seekersPercent = totalUsersCount > 0 ? Math.round((seekersCount / totalUsersCount) * 100) : 0;
  const ownersPercent = totalUsersCount > 0 ? Math.round((ownersCount / totalUsersCount) * 100) : 0;
  const companiesPercent = totalUsersCount > 0 ? Math.round((companiesCount / totalUsersCount) * 100) : 0;

  const totalListingsCount = l.total_listings || 0;
  const realLandlordsCount = l.real_landlords || 0;
  const scrapedCount = l.scraped || 0;
  const realPercent = totalListingsCount > 0 ? Math.round((realLandlordsCount / totalListingsCount) * 100) : 0;
  const scrapedPercent = totalListingsCount > 0 ? Math.max(0, 100 - realPercent) : 0;

  const rentCount = l.rent_count || 0;
  const saleCount = l.sale_count || 0;

  const rentLocalities = s.rent_localities || s.localities || [];
  const saleLocalities = s.sale_localities || [];

  const activeLocalities = dealTypeTab === 'rent' ? rentLocalities : saleLocalities;
  const gmvFormatted = l.total_gmv ? `₹${(l.total_gmv / 100000).toFixed(1)} Lakhs` : '₹0.0 Lakhs';

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00ADB5] bg-primary/10 px-2.5 py-0.5 rounded-full">
              Live Database Aggregation
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● Differentiated Rent vs Sale
            </span>
          </div>
          <h3 className="text-xl font-black text-[#222831] mt-1">Platform Intelligence & Market Analytics</h3>
          <p className="text-xs text-text-secondary font-medium mt-1">
            Real-time rental market rates and property sales valuations separated by transaction type.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={exportAdminAnalyticsCSV} className="whitespace-nowrap">
          Export Full Analytics CSV ↓
        </Button>
      </div>

      {/* 4 Dynamic Real-Time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">Rental GMV Monthly Volume</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CostIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">{gmvFormatted}</div>
          <p className="text-[11px] text-text-secondary font-semibold">Sum of monthly active rents ({rentCount} properties)</p>
        </Card>

        <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">Average Monthly Rent</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[#00ADB5]">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#00ADB5] tabular-nums">
            ₹{Number(l.avg_rent || 0).toLocaleString('en-IN')}/mo
          </div>
          <p className="text-[11px] text-text-secondary font-semibold">Calculated strictly on rental properties</p>
        </Card>

        <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">Catalog Split (Rent vs Sale)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <BrowseIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#222831] tabular-nums">{rentCount} Rent / {saleCount} Sale</div>
          <p className="text-[11px] text-text-secondary font-semibold">{totalListingsCount} total active catalog listings</p>
        </Card>

        <Card className="p-5 bg-white border border-border rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider block">Real Landlords Ratio</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#222831] tabular-nums">{realPercent}% Verified</div>
          <p className="text-[11px] text-text-secondary font-semibold">{realLandlordsCount} posted by registered owners</p>
        </Card>
      </div>

      {/* Real-Time Locality Market Intelligence Table with Rent / Sale Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="font-black text-base text-[#222831]">
              Locality Market Valuation ({dealTypeTab === 'rent' ? 'Rental Properties' : 'Sale Apartments'})
            </h4>

            {/* Rent vs Sale Filter Toggle */}
            <div className="flex bg-surface p-1 rounded-xl border border-border text-xs font-black">
              <button
                onClick={() => setDealTypeTab('rent')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dealTypeTab === 'rent' ? 'bg-[#00ADB5] text-white shadow-xs' : 'text-text-secondary hover:text-[#222831]'
                }`}
              >
                🏠 Rent ({rentCount})
              </button>
              <button
                onClick={() => setDealTypeTab('sale')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dealTypeTab === 'sale' ? 'bg-[#00ADB5] text-white shadow-xs' : 'text-text-secondary hover:text-[#222831]'
                }`}
              >
                🏢 Sale ({saleCount})
              </button>
            </div>
          </div>

          {activeLocalities.length === 0 ? (
            <Card className="text-center py-12 text-xs text-text-secondary bg-white border border-border rounded-2xl">
              No {dealTypeTab} properties cataloged in database.
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden border border-border rounded-2xl bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium border-collapse">
                  <thead className="bg-surface text-[#393E46] border-b border-border uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Locality Name</th>
                      <th className="py-3.5 px-4">Active Listings</th>
                      <th className="py-3.5 px-4">
                        {dealTypeTab === 'rent' ? 'Avg Monthly Rent' : 'Avg Sale Valuation'}
                      </th>
                      <th className="py-3.5 px-4">
                        {dealTypeTab === 'rent' ? 'Rent Price Band' : 'Sale Price Band'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeLocalities.map((loc) => (
                      <tr key={loc.name} className="hover:bg-surface/50 transition-colors">
                        <td className="py-4 px-4 font-extrabold text-[#222831]">
                          <div className="flex items-center gap-1.5">
                            <MapPinIcon className="w-3.5 h-3.5 text-[#00ADB5]" />
                            <span>{loc.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-text-primary">{loc.listings} properties</td>
                        <td className="py-4 px-4 font-black text-emerald-600">
                          {dealTypeTab === 'rent'
                            ? `₹${Number(loc.avgRent || 0).toLocaleString('en-IN')}/mo`
                            : (loc.avgPriceFormatted || `₹${Number(loc.avgPrice || 0).toLocaleString('en-IN')}`)}
                        </td>
                        <td className="py-4 px-4 text-text-secondary font-bold">{loc.range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Dynamic User & Catalog Distribution */}
        <div className="space-y-6">
          <h4 className="font-black text-base text-[#222831]">Platform Ecosystem Breakdown</h4>
          <Card className="p-6 bg-white border border-border rounded-2xl space-y-4 shadow-xs">
            <h5 className="font-bold text-xs text-[#393E46] uppercase tracking-wider">User Roles Distribution</h5>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Accommodation Seekers</span>
                  <span className="text-[#00ADB5]">{seekersPercent}% ({seekersCount} users)</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-[#00ADB5] h-full" style={{ width: `${seekersPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Property Owners / Landlords</span>
                  <span className="text-emerald-600">{ownersPercent}% ({ownersCount} users)</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-emerald-500 h-full" style={{ width: `${ownersPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Company HR Relocation Teams</span>
                  <span className="text-purple-600">{companiesPercent}% ({companiesCount} teams)</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                  <div className="bg-purple-500 h-full" style={{ width: `${companiesPercent}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-border rounded-2xl space-y-3 shadow-xs">
            <h5 className="font-bold text-xs text-[#393E46] uppercase tracking-wider">Property Verification Ratio</h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Verified Real Landlord Listings</span>
                <span className="font-extrabold text-emerald-600">{realPercent}% ({realLandlordsCount})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Web Crawled / Scraped Data</span>
                <span className="font-extrabold text-amber-600">{scrapedPercent}% ({scrapedCount})</span>
              </div>
              <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border flex mt-2">
                <div className="bg-emerald-500 h-full" style={{ width: `${realPercent}%` }} />
                <div className="bg-amber-500 h-full" style={{ width: `${scrapedPercent}%` }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
