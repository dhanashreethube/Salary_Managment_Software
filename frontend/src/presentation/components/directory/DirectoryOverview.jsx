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
    sortBy,
    sortOrder,
    handleSort,
    handleLimitChange,
    isLoading,
    isFetching,
    isError,
    error,
    handlePrevPage,
    handleNextPage,
    handleReset,
    formatCurrency,
  } = useDirectoryLogic();

  const headers = [
    { label: "Employee ID", align: "left", sortKey: "employeeId" },
    { label: "Employee Name", align: "left", sortKey: "firstName" },
    { label: "Department & Role", align: "left" },
    { label: "Country", align: "left" },
    { label: "Base Salary", align: "right", sortKey: "baseSalary" },
    { label: "Bonus", align: "right" },
    { label: "Allowance", align: "right" },
    { label: "Deduction", align: "right" },
    { label: "Joining Date", align: "left", sortKey: "joiningDate" },
    { label: "Comment", align: "left" },
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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl space-y-4">
        <span className="text-sm font-semibold text-rose-400">Failed to synchronize directory. {error?.message}</span>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Reset and Retry
        </button>
      </div>
    );
  }

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
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        <PaginationNav
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onLimitChange={handleLimitChange}
        />
      </div>
    </div>
  );
}
