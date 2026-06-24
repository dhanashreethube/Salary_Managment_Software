import React from "react";
import { Briefcase } from "lucide-react";
import DataTable from "../ui/DataTable.jsx";

export default function DepartmentTable({ departmentAllocations = [] }) {
  const headers = [
    { label: "Department", align: "left" },
    { label: "Avg Base Salary", align: "right" },
    { label: "Avg Bonus", align: "right" },
    { label: "Avg Allowance", align: "right" },
    { label: "Avg Deduction", align: "right" },
  ];

  const renderRow = (dept) => (
    <tr key={dept.department} className="hover:bg-white/5 transition-colors">
      <td className="py-3.5 text-white flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        {dept.department}
      </td>
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
  );

  return (
    <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase size={20} className="text-indigo-400" />
        <h4 className="text-lg font-bold text-white">Departmental Expenditure & Averages</h4>
      </div>
      <DataTable
        headers={headers}
        rows={departmentAllocations}
        renderRow={renderRow}
        headerCellClassName="pb-3"
      />
    </div>
  );
}
