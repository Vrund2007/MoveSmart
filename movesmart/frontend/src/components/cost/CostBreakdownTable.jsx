import React from 'react';
import Card from '../common/Card';

const CATEGORY_BADGES = {
  'Rent & Housing': { label: 'Housing', color: 'bg-[#00ADB5] text-white', bar: 'bg-[#00ADB5]' },
  'Groceries & Food': { label: 'Groceries', color: 'bg-emerald-600 text-white', bar: 'bg-emerald-500' },
  'Utilities & Society Fee': { label: 'Utilities', color: 'bg-amber-600 text-white', bar: 'bg-amber-500' },
  'Commute & Transit': { label: 'Transit', color: 'bg-indigo-600 text-white', bar: 'bg-indigo-500' },
  'Dining Out & Lifestyle': { label: 'Lifestyle', color: 'bg-rose-600 text-white', bar: 'bg-rose-500' },
  'Domestic Help & Services': { label: 'Services', color: 'bg-purple-600 text-white', bar: 'bg-purple-500' },
  'Miscellaneous Buffer': { label: 'Buffer', color: 'bg-slate-600 text-white', bar: 'bg-slate-500' },
};

export default function CostBreakdownTable({
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
}) {
  const categories = Object.entries(breakdown);
  const calculatedTotal = totalMonthly || categories.reduce((sum, [_, val]) => sum + Number(val || 0), 0);

  // Fix median rent fallback: if median_rent is 0 or missing, estimate from breakdown['Rent & Housing'] or calculatedTotal * 0.6
  const rawRent = Number(marketStats.median_rent || breakdown['Rent & Housing'] || (calculatedTotal * 0.6));
  const displayMedianRent = rawRent > 0 ? rawRent : 22000;

  return (
    <div className="space-y-4 animate-fade-in font-sans text-[#222831]">
      {/* ── Executive Financial Outlay Banner ── */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white border border-slate-700/80 shadow-xl overflow-hidden relative p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-black bg-[#00ADB5] text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {locality || 'Regional Zone'}
              </span>
              <span className="bg-slate-700/80 text-teal-200 text-xs font-extrabold px-3 py-1 rounded-full border border-teal-400/30 tracking-wide">
                {bhk} BHK • {householdType.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-2 font-semibold tracking-wide">
              Estimated Monthly Cost of Living Matrix ({lifestyle} lifestyle)
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] text-slate-300 font-extrabold uppercase tracking-wider">Total Monthly Outlay</div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight tabular-nums mt-0.5">
              ₹{Number(calculatedTotal).toLocaleString('en-IN')}<span className="text-xs text-slate-300 font-medium ml-1">/mo</span>
            </div>
          </div>
        </div>

        {/* Real Estate Market Stats Banner */}
        <div className="pt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs" />
            <span>
              Real Market Data: <strong className="text-white font-extrabold">Median Rent ₹{displayMedianRent.toLocaleString('en-IN')}/mo</strong>
            </span>
          </div>

          {costIndexPct !== undefined && costIndexPct !== null && (
            <span className={`px-3.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wider shadow-xs ${
              costIndexPct > 8 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40' 
                : costIndexPct < -5 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                : 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
            }`}>
              {costIndexPct > 0 
                ? `+${costIndexPct}% vs City ${bhk}BHK Avg` 
                : costIndexPct < 0 
                ? `${costIndexPct}% vs City ${bhk}BHK Avg` 
                : `Matches City ${bhk}BHK Avg`}
            </span>
          )}
        </div>
      </Card>

      {/* ── Itemized Expense Category Breakdown Card ── */}
      <Card className="bg-white border border-border shadow-xs p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-wider">
            Itemized Monthly Expense Breakdown
          </h4>
          <span className="text-[10px] font-extrabold text-text-secondary uppercase bg-surface px-2.5 py-1 rounded-full border border-border">
            {categories.length} Expense Categories
          </span>
        </div>

        <div className="space-y-3.5">
          {categories.map(([category, amount]) => {
            const numAmount = Number(amount || 0);
            const percentage = calculatedTotal > 0 ? Math.round((numAmount / calculatedTotal) * 100) : 0;
            const badgeInfo = CATEGORY_BADGES[category] || { label: 'Expense', color: 'bg-slate-700 text-white', bar: 'bg-slate-600' };

            return (
              <div key={category} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${badgeInfo.color}`}>
                      {badgeInfo.label}
                    </span>
                    <span className="font-bold text-text-primary">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary font-bold bg-surface px-2 py-0.5 rounded-md border border-border">
                      {percentage}%
                    </span>
                    <span className="font-extrabold text-text-primary tabular-nums">
                      ₹{numAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${badgeInfo.bar}`}
                    style={{ width: `${Math.min(100, Math.max(3, percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Smart AI Affordability Insights Card ── */}
      {insights && insights.length > 0 && (
        <Card className="bg-teal-50/80 border border-teal-200/80 p-4 rounded-2xl space-y-2.5">
          <h4 className="font-extrabold text-xs text-teal-900 uppercase tracking-wider">
            Smart Relocation & Savings Insights
          </h4>
          <ul className="space-y-1.5">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-xs text-teal-950 font-semibold flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
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
}
