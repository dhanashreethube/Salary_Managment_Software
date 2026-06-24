import React from "react";
import { useDirectoryLogic } from "./useDirectoryLogic.js";
import ControlPanel from "./ControlPanel.jsx";
import DataTable from "../ui/DataTable.jsx";
import EmployeeRow from "./EmployeeRow.jsx";
import PaginationNav from "./PaginationNav.jsx";

export default function DirectoryOverview({ onEditClick }) {
  const {
    employees,
    total,
    page,
    totalPages,
    limit,
    search,
    setSearch,
    country,
    handleCountryChange,
    department,
    handleDepartmentChange,
    isLoading,
    isFetching,
    handlePrevPage,
    handleNextPage,
    handleReset,
    formatCurrency,
  } = useDirectoryLogic();

  const headers = [
    { label: "Employee ID", align: "left" },
    { label: "Employee Name", align: "left" },
    { label: "Department & Role", align: "left" },
    { label: "Country", align: "left" },
    { label: "Base Salary", align: "right" },
    { label: "Bonus", align: "right" },
    { label: "Allowance", align: "right" },
    { label: "Deduction", align: "right" },
    { label: "Action", align: "center" },
  ];

  const renderRow = (employee) => (
    <EmployeeRow
      key={employee.id}
      employee={employee}
      formatCurrency={formatCurrency}
      onEditClick={onEditClick}
    />
  );

  return (
    <div className="space-y-6">
      {/* Filtering Actions Panel */}
      <ControlPanel
        search={search}
        setSearch={setSearch}
        country={country}
        onCountryChange={handleCountryChange}
        department={department}
        onDepartmentChange={handleDepartmentChange}
        onReset={handleReset}
      />

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

        <DataTable
          headers={headers}
          rows={employees}
          renderRow={renderRow}
          isEmpty={!isLoading && employees.length === 0}
          emptyMessage="No employee records found matching your current filter criteria."
          isLoading={isLoading}
        />

        <PaginationNav
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      </div>
    </div>
  );
}
