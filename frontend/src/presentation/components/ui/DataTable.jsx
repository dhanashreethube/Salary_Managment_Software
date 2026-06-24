import React from "react";

/**
 * Reusable HTML table scaffolding with standardized column alignment,
 * loading overlays, empty states, and row render functions.
 */
export default function DataTable({
  headers,
  rows = [],
  renderRow,
  isEmpty = false,
  emptyMessage = "No records found.",
  isLoading = false,
  headerCellClassName = "py-4 px-6",
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-slate-950/30 border-b border-white/5">
          <tr>
            {headers.map((h, index) => {
              const alignmentClass =
                h.align === "right"
                  ? "text-right"
                  : h.align === "center"
                  ? "text-center"
                  : "text-left";
              return (
                <th
                  key={index}
                  className={`${headerCellClassName} font-semibold ${alignmentClass}`}
                >
                  {h.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-medium">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center text-slate-500 font-medium">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading table records...</span>
                </div>
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center text-slate-505 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => renderRow(row, idx))
          )}
        </tbody>
      </table>
    </div>
  );
}
