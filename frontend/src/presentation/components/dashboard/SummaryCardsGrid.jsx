import React from "react";
import { DollarSign, Users, Globe, TrendingUp } from "lucide-react";
import MetricCard from "../ui/MetricCard.jsx";

export default function SummaryCardsGrid({ runRates, headcount, formatCurrency }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total Run Rate */}
      <MetricCard
        title="Est. Global Run-Rate"
        value={formatCurrency(runRates.totalUSD, "USD", { fractionDigits: 0 })}
        glowColor="bg-indigo-500/10"
        icon={
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <DollarSign size={24} />
          </div>
        }
        subtitle={
          <p className="text-xs text-indigo-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            USD Equivalent / Year
          </p>
        }
      />

      {/* Card 2: Total Headcount */}
      <MetricCard
        title="Active Global Headcount"
        value={headcount.total.toLocaleString()}
        glowColor="bg-violet-500/10"
        icon={
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
            <Users size={24} />
          </div>
        }
        subtitle={
          <p className="text-xs text-violet-400 font-medium mt-1">
            Full-Time Employees
          </p>
        }
      />

      {/* Card 3: Currency Clusters */}
      <MetricCard
        title="Currencies Administered"
        value={runRates.breakdown.length}
        glowColor="bg-emerald-500/10"
        icon={
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Globe size={24} />
          </div>
        }
        subtitle={
          <p className="text-xs text-emerald-400 font-medium mt-1">
            INR, USD, GBP, EUR
          </p>
        }
      />
    </div>
  );
}
