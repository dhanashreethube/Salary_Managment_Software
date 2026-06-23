import React from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Edit2, SlidersHorizontal, RefreshCcw } from "lucide-react";

export default function Directory({
  employees,
  total,
  page,
  setPage,
  search,
  setSearch,
  country,
  setCountry,
  department,
  setDepartment,
  isLoading,
  onEditClick,
  refetch,
  isFetching,
}) {
  const limit = 20;
  const totalPages = Math.ceil(total / limit) || 1;

  // Currencies formatting helper
  const formatCurrency = (val, currency) => {
    // values are stored in lowest denominators (cents, paise)
    const realValue = (val || 0) / 100;
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2,
    }).format(realValue);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Reset all filters
  const handleReset = () => {
    setSearch("");
    setCountry("");
    setDepartment("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filtering Actions Panel */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page to 1 for new search
            }}
            placeholder="Search Name or Employee ID..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto gap-3 items-center justify-end">
          {/* Country filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/40 border border-white/10 rounded-xl px-3 py-1">
            <Filter size={14} className="text-slate-400" />
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-0 text-slate-200 text-sm focus:outline-none py-1.5 pr-2"
            >
              <option value="" className="bg-slate-905 bg-[#0b0f19]">All Countries</option>
              <option value="India" className="bg-slate-905 bg-[#0b0f19]">India</option>
              <option value="United States" className="bg-slate-905 bg-[#0b0f19]">United States</option>
              <option value="United Kingdom" className="bg-slate-905 bg-[#0b0f19]">United Kingdom</option>
              <option value="Germany" className="bg-slate-905 bg-[#0b0f19]">Germany</option>
            </select>
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/40 border border-white/10 rounded-xl px-3 py-1">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-0 text-slate-200 text-sm focus:outline-none py-1.5 pr-2"
            >
              <option value="" className="bg-slate-905 bg-[#0b0f19]">All Departments</option>
              <option value="Engineering" className="bg-slate-905 bg-[#0b0f19]">Engineering</option>
              <option value="Product" className="bg-slate-905 bg-[#0b0f19]">Product</option>
              <option value="HR" className="bg-slate-905 bg-[#0b0f19]">HR</option>
              <option value="Sales" className="bg-slate-905 bg-[#0b0f19]">Sales</option>
              <option value="Marketing" className="bg-slate-905 bg-[#0b0f19]">Marketing</option>
            </select>
          </div>

          {/* Reload/Reset Actions */}
          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors hover:text-white"
            title="Reset Filters"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Grid Content Table */}
      <div className="glass-panel rounded-2xl overflow-hidden relative min-h-[400px]">
        {/* Loading Overlay */}
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity">
            <div className="flex items-center gap-3 bg-[#0d1527] border border-indigo-500/20 px-5 py-3.5 rounded-2xl shadow-xl">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-white">Fetching database index...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/30 border-b border-white/5">
              <tr>
                <th className="py-4 px-6 font-semibold">Employee ID</th>
                <th className="py-4 px-6 font-semibold">Employee Name</th>
                <th className="py-4 px-6 font-semibold">Department & Role</th>
                <th className="py-4 px-6 font-semibold">Country</th>
                <th className="py-4 px-6 font-semibold text-right">Base Salary</th>
                <th className="py-4 px-6 font-semibold text-right">Bonus</th>
                <th className="py-4 px-6 font-semibold text-right">Allowance</th>
                <th className="py-4 px-6 font-semibold text-right">Deduction</th>
                <th className="py-4 px-6 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {!isLoading && employees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    No employee records found matching your current filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const base = emp.compensation?.baseSalary || 0;
                  const bonus = emp.compensation?.bonus || 0;
                  const allowance = emp.compensation?.allowances || 0;
                  const deduction = emp.compensation?.deductions || 0;

                  return (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-indigo-400 font-bold">{emp.employeeId}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-semibold">{emp.firstName} {emp.lastName}</span>
                          <span className="text-slate-500 text-xs font-normal">{emp.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-200 text-xs font-semibold">{emp.department}</span>
                          <span className="text-slate-500 text-xs font-normal">{emp.role}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{emp.country}</td>
                      <td className="py-4 px-6 text-right font-mono text-white">
                        {formatCurrency(base, emp.currency)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-indigo-300">
                        {formatCurrency(bonus, emp.currency)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-300">
                        {formatCurrency(allowance, emp.currency)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-rose-300">
                        -{formatCurrency(deduction, emp.currency)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => onEditClick(emp)}
                          className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all"
                          title="Modify Salary details"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 px-6 py-4 gap-4 bg-slate-950/20">
          <div className="text-xs text-slate-400">
            Showing <span className="text-white font-semibold">{((page - 1) * limit) + 1}</span> to{" "}
            <span className="text-white font-semibold">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="text-white font-semibold">{total.toLocaleString()}</span> employees
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className={`p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all ${
                page <= 1 ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-xs text-slate-300 font-mono px-3">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-slate-500 font-bold">{totalPages}</span>
            </div>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className={`p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all ${
                page >= totalPages ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
