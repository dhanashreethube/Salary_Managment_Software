import React from "react";
import { Edit2, CalendarDays, MessageSquareText } from "lucide-react";

export default function EmployeeRow({ employee, formatCurrency, onEditClick }) {
  const base = employee.compensation?.baseSalary || 0;
  const bonus = employee.compensation?.bonus || 0;
  const allowance = employee.compensation?.allowances || 0;
  const deduction = employee.compensation?.deductions || 0;
  const comment = employee.compensation?.comment || null;

  // Parse and format joining date
  const formattedJoiningDate = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="py-4 px-6 font-mono text-xs text-indigo-400 font-bold">
        {employee.employeeId}
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-col">
          <span className="text-white text-sm font-semibold">
            {employee.firstName} {employee.lastName}
          </span>
          <span className="text-slate-500 text-xs font-normal">{employee.email}</span>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-col">
          <span className="text-slate-202 text-xs font-semibold">{employee.department}</span>
          <span className="text-slate-505 text-xs font-normal">{employee.role}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-slate-300">{employee.country}</td>
      <td className="py-4 px-6 text-right font-mono text-white">
        {formatCurrency(base, employee.currency)}
      </td>
      <td className="py-4 px-6 text-right font-mono text-indigo-300">
        {formatCurrency(bonus, employee.currency)}
      </td>
      <td className="py-4 px-6 text-right font-mono text-emerald-300">
        {formatCurrency(allowance, employee.currency)}
      </td>
      <td className="py-4 px-6 text-right font-mono text-rose-300">
        -{formatCurrency(deduction, employee.currency)}
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays size={12} className="text-slate-500 shrink-0" />
          <span className="whitespace-nowrap">{formattedJoiningDate}</span>
        </div>
      </td>
      <td className="py-4 px-6 max-w-[160px]">
        {comment ? (
          <div className="flex items-start gap-1.5 text-xs text-slate-400" title={comment}>
            <MessageSquareText size={12} className="text-slate-500 shrink-0 mt-0.5" />
            <span className="truncate">{comment}</span>
          </div>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        )}
      </td>
      <td className="py-4 px-6 text-center">
        <button
          onClick={() => onEditClick(employee)}
          className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all"
          title="Modify Salary details"
        >
          <Edit2 size={14} />
        </button>
      </td>
    </tr>
  );
}
