import React from "react";
import { X, DollarSign, PlusCircle, ShieldAlert, Award } from "lucide-react";
import { useModifySalary } from "./useModifySalary.js";

export default function ModifySalaryModal({ employee, onClose }) {
  const {
    baseSalary,
    setBaseSalary,
    bonus,
    setBonus,
    allowances,
    setAllowances,
    deductions,
    setDeductions,
    errorMsg,
    isPending,
    handleSubmit,
  } = useModifySalary(employee, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card container */}
      <div className="w-full max-w-lg bg-[#0e1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white">Adjust Salary Terms</h3>
            <p className="text-xs text-slate-500 font-mono">
              Employee ID: {employee.employeeId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Employee Meta details */}
          <div className="bg-slate-900/60 rounded-xl p-3.5 border border-white/5 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-505 block">Employee Profile</span>
              <span className="text-white font-bold text-sm">
                {employee.firstName} {employee.lastName}
              </span>
              <span className="text-slate-404 block mt-0.5">
                {employee.role} ({employee.department})
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-505 block">Currency Base</span>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-mono font-bold rounded mt-1 inline-block">
                {employee.currency}
              </span>
              <span className="text-slate-404 block mt-0.5">{employee.country}</span>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-2.5 items-start text-xs text-rose-400 font-semibold animate-shake">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Base Salary */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <DollarSign size={12} /> Base Salary ({employee.currency})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>

            {/* Bonus */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Award size={12} /> Bonus ({employee.currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>

            {/* Allowance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <PlusCircle size={12} /> Allowance ({employee.currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>

            {/* Deductions */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                Deductions ({employee.currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
