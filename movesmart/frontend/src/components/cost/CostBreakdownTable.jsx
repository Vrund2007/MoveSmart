import React from 'react';
import Card from '../common/Card';

/**
 * Premium Locality Cost Breakdown Component
 * Renders itemized expense breakdown, visual progress bars, real MongoDB market stats, and AI insights.
 */
const CATEGORY_ICONS = {
  'Rent & Housing': '🏠',
  'Groceries & Food': '🛒',
  'Utilities & Society Fee': '⚡',
  'Commute & Transit': '🚗',
  'Dining Out & Lifestyle': '🍽️',
  'Domestic Help & Services': '🧹',
  'Miscellaneous Buffer': '🛡️',
};

const CATEGORY_COLORS = {
  'Rent & Housing': 'bg-primary',
  'Groceries & Food': 'bg-emerald-500',
  'Utilities & Society Fee': 'bg-amber-500',
  'Commute & Transit': 'bg-indigo-500',
  'Dining Out & Lifestyle': 'bg-rose-500',
  'Domestic Help & Services': 'bg-purple-500',
  'Miscellaneous Buffer': 'bg-gray-400',
};

const CostBreakdownTable = ({
  breakdown = {},
  locality = '',
  bhk = 2,
  householdType = 'bachelor',
  lifestyle = 'balanced',
  commuteMode = 'bike',
  marketStats = {},
  totalMonthly = 0,
  costIndexPct = 0,
  insights = [],
  disclaimer = ''
}) => {
  const categories = Object.entries(breakdown);
  const calculatedTotal = totalMonthly || categories.reduce((sum, [_, val]) => sum + Number(val || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Summary & Market Snapshot Header Card ── */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-0 shadow-xl overflow-hidden relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <h3 className="font-extrabold text-lg text-white">{locality}</h3>
              <span className="bg-white/15 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                {bhk} BHK • {householdType.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Estimated Monthly Cost of Living Matrix ({lifestyle} lifestyle)
            </p>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Monthly Outlay</div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              ₹{Number(calculatedTotal).toLocaleString('en-IN')}<span className="text-xs text-gray-300 font-normal">/mo</span>
            </div>
          </div>
        </div>

        {/* Real Estate Market Stats Banner */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-300">
            <span className="text-amber-400">📊</span>
            <span>
              <b>Real Market Data:</b> Median Rent ₹{Number(marketStats.median_rent || 0).toLocaleString('en-IN')}/mo
              {marketStats.listings_count > 0 && ` (${marketStats.listings_count} active MongoDB listings)`}
            </span>
          </div>

          {costIndexPct !== undefined && costIndexPct !== null && (
            <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
              costIndexPct > 8 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                : costIndexPct < -5 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {costIndexPct > 0 
                ? `⚡ +${costIndexPct}% vs City ${bhk}BHK Avg` 
                : costIndexPct < 0 
                ? `🎯 ${costIndexPct}% vs City ${bhk}BHK Avg` 
                : `⚖️ Matches City ${bhk}BHK Avg`}
            </span>
          )}

        </div>
      </Card>

      {/* ── Itemized Expense Category Breakdown Card ── */}
      <Card className="bg-white border border-border shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <span>📋</span> Itemized Monthly Expense Breakdown
          </h4>
          <span className="text-[11px] text-text-secondary font-semibold">7 Cost Categories</span>
        </div>

        <div className="space-y-3">
          {categories.map(([category, amount]) => {
            const numAmount = Number(amount || 0);
            const percentage = calculatedTotal > 0 ? Math.round((numAmount / calculatedTotal) * 100) : 0;
            const icon = CATEGORY_ICONS[category] || '💸';
            const colorClass = CATEGORY_COLORS[category] || 'bg-primary';

            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <span>{icon}</span> {category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                      {percentage}%
                    </span>
                    <span className="font-extrabold text-text-primary">
                      ₹{numAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Smart AI Affordability Insights Card ── */}
      {insights && insights.length > 0 && (
        <Card className="bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
          <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
            <span>💡</span> Smart Relocation & Savings Insights
          </h4>
          <ul className="space-y-1.5">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-xs text-emerald-950 font-medium flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {disclaimer && (
        <p className="text-[10px] text-text-secondary italic text-center px-2">
          {disclaimer}
        </p>
      )}
    </div>
  );
};

export default CostBreakdownTable;
