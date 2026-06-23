import React from "react";
import { Users, DollarSign, Globe, Award, Briefcase, TrendingUp } from "lucide-react";

export default function Dashboard({ metrics, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-32 glass-panel rounded-2xl p-6" />
        ))}
        <div className="md:col-span-2 h-80 glass-panel rounded-2xl p-6" />
        <div className="h-80 glass-panel rounded-2xl p-6" />
      </div>
    );
  }

  const { headcount, runRates, departmentAllocations } = metrics || {
    headcount: { total: 0, distribution: [] },
    runRates: { totalUSD: 0, breakdown: [] },
    departmentAllocations: []
  };

  // Helper to format currency numbers beautifully
  const formatCurrency = (val, currency = "USD") => {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Run Rate */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div>
            <span className="text-sm font-medium text-slate-400">Est. Global Run-Rate</span>
            <h3 className="text-3xl font-bold tracking-tight text-white mt-1">
              {formatCurrency(runRates.totalUSD, "USD")}
            </h3>
            <p className="text-xs text-indigo-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              USD Equivalent / Year
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card 2: Total Headcount */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div>
            <span className="text-sm font-medium text-slate-400">Active Global Headcount</span>
            <h3 className="text-3xl font-bold tracking-tight text-white mt-1">
              {headcount.total.toLocaleString()}
            </h3>
            <p className="text-xs text-violet-400 font-medium mt-1">Full-Time Employees</p>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
            <Users size={24} />
          </div>
        </div>

        {/* Card 3: Currency Clusters */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div>
            <span className="text-sm font-medium text-slate-400">Currencies Administered</span>
            <h3 className="text-3xl font-bold tracking-tight text-white mt-1">
              {runRates.breakdown.length}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-1">INR, USD, GBP, EUR</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Globe size={24} />
          </div>
        </div>
      </div>

      {/* Main Aggregates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Expenditures */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Briefcase size={20} className="text-indigo-400" />
            <h4 className="text-lg font-bold text-white">Departmental Expenditure & Averages</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase border-b border-white/5">
                <tr>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold text-right">Avg Base Salary</th>
                  <th className="pb-3 font-semibold text-right">Avg Bonus</th>
                  <th className="pb-3 font-semibold text-right">Avg Allowance</th>
                  <th className="pb-3 font-semibold text-right">Avg Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {departmentAllocations.map((dept) => (
                  <tr key={dept.department} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {dept.department}
                    </td>
                    {/* Display averages as clean values (mixed currencies displayed relative to base values) */}
                    <td className="py-3.5 text-right font-mono text-white">
                      {dept.avgBaseSalaryReal.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono text-indigo-300">
                      {dept.avgBonusReal.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono text-emerald-300">
                      {dept.avgAllowancesReal.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono text-rose-300">
                      -{dept.avgDeductionsReal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Headcount Distribution */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-violet-400" />
              <h4 className="text-lg font-bold text-white">Headcount by Country</h4>
            </div>
            <div className="space-y-4">
              {headcount.distribution.map((item) => (
                <div key={item.country} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-300">{item.country}</span>
                    <span className="font-mono text-slate-400">
                      {item.count.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Global Distribution Matrix</span>
            <span className="text-indigo-400 font-bold">100% Consolidated</span>
          </div>
        </div>
      </div>

      {/* Currency Annual Breakdown Panels */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-emerald-400" />
          <h4 className="text-lg font-bold text-white">Consolidated Annual Spend by Currency Group</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {runRates.breakdown.map((item) => (
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
                <span className="text-xs text-slate-500 font-medium block">Total Annual Gross</span>
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
    </div>
  );
}
