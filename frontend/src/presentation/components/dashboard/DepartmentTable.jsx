import React, { useState } from "react";
import { Briefcase } from "lucide-react";
import DataTable from "../ui/DataTable.jsx";

export default function DepartmentTable({ departmentAllocations = [] }) {
  const [sortBy, setSortBy] = useState("department");
  const [sortOrder, setSortOrder] = useState("asc");

  const headers = [
    { label: "Department", align: "left", sortKey: "department" },
    { label: "Avg Base Salary", align: "right", sortKey: "avgBaseSalary" },
    { label: "Avg Bonus", align: "right", sortKey: "avgBonus" },
    { label: "Avg Allowance", align: "right", sortKey: "avgAllowance" },
    { label: "Avg Deduction", align: "right", sortKey: "avgDeduction" },
  ];

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
  };

  const sortedRows = [...departmentAllocations].sort((a, b) => {
    let valA, valB;
    if (sortBy === "department") {
      valA = a.department || "";
      valB = b.department || "";
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (sortBy === "avgBaseSalary") {
      valA = a.avgBaseSalaryReal || 0;
      valB = b.avgBaseSalaryReal || 0;
    } else if (sortBy === "avgBonus") {
      valA = a.avgBonusReal || 0;
      valB = b.avgBonusReal || 0;
    } else if (sortBy === "avgAllowance") {
      valA = a.avgAllowancesReal || 0;
      valB = b.avgAllowancesReal || 0;
    } else if (sortBy === "avgDeduction") {
      valA = a.avgDeductionsReal || 0;
      valB = b.avgDeductionsReal || 0;
    }
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

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
        rows={sortedRows}
        renderRow={renderRow}
        headerCellClassName="pb-3"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  );
}
