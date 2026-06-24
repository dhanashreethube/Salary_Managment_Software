import React from "react";
import { Award } from "lucide-react";

export default function CurrencyPanels({ runRates, formatCurrency }) {
  const breakdown = runRates?.breakdown || [];

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Award size={20} className="text-emerald-400" />
        <h4 className="text-lg font-bold text-white">Consolidated Annual Spend by Currency Group</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {breakdown.map((item) => (
          <div key={item.currency} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono font-bold rounded text-xs">
                {item.currency}
              </span>
              <span className="text-xs text-slate-400">
                {item.employeeCount.toLocaleString()} employees
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-505 font-medium block">Total Annual Gross</span>
              <span className="text-lg font-bold text-white font-mono block">
                {formatCurrency(item.totalGrossSpendReal, item.currency)}
              </span>
            </div>
            <div className="text-2xs text-indigo-400 font-mono">
              USD Eq: {formatCurrency(item.usdEquivalentGrossSpend, "USD")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
