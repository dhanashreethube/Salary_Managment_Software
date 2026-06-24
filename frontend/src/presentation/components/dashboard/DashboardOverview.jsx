import React from "react";
import { useDashboardMetrics } from "./useDashboardMetrics.js";
import SummaryCardsGrid from "./SummaryCardsGrid.jsx";
import DepartmentTable from "./DepartmentTable.jsx";
import HeadcountList from "./HeadcountList.jsx";
import CurrencyPanels from "./CurrencyPanels.jsx";

export default function DashboardOverview() {
  const { metrics, isLoading, formatCurrency } = useDashboardMetrics();

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
    departmentAllocations: [],
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Metric Cards */}
      <SummaryCardsGrid
        runRates={runRates}
        headcount={headcount}
        formatCurrency={formatCurrency}
      />

      {/* Main Aggregates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DepartmentTable departmentAllocations={departmentAllocations} />
        <HeadcountList headcount={headcount} />
      </div>

      {/* Currency Annual Spend Panels */}
      <CurrencyPanels runRates={runRates} formatCurrency={formatCurrency} />
    </div>
  );
}
