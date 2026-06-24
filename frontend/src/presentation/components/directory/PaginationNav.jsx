import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationNav({
  page,
  totalPages,
  total,
  limit,
  onPrevPage,
  onNextPage,
  onLimitChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 px-6 py-4 gap-4 bg-slate-950/20">
      <div className="text-xs text-slate-400">
        Showing <span className="text-white font-semibold">{total > 0 ? ((page - 1) * limit) + 1 : 0}</span> to{" "}
        <span className="text-white font-semibold">
          {Math.min(page * limit, total)}
        </span>{" "}
        of <span className="text-white font-semibold">{total.toLocaleString()}</span> employees
      </div>

      <div className="flex items-center gap-3">
        {/* Pagination controls */}
        <button
          onClick={onPrevPage}
          disabled={page <= 1}
          className={`p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all ${
            page <= 1 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-xs text-slate-303 font-mono px-3">
          Page <span className="text-white font-bold">{page}</span> of <span className="text-slate-500 font-bold">{totalPages}</span>
        </div>
        <button
          onClick={onNextPage}
          disabled={page >= totalPages}
          className={`p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all ${
            page >= totalPages ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <ChevronRight size={16} />
        </button>

        {/* Page size selector (at the end) */}
        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-slate-500">Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(e.target.value)}
              className="bg-slate-800 border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="10" className="bg-[#0b0f19]">10</option>
              <option value="20" className="bg-[#0b0f19]">20</option>
              <option value="50" className="bg-[#0b0f19]">50</option>
              <option value="100" className="bg-[#0b0f19]">100</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
