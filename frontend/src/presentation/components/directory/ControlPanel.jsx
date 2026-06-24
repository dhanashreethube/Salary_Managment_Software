import React from "react";
import { RefreshCcw } from "lucide-react";
import SearchBar from "./SearchBar.jsx";
import FilterSelects from "./FilterSelects.jsx";

export default function ControlPanel({
  search,
  setSearch,
  country,
  onCountryChange,
  department,
  onDepartmentChange,
  onReset,
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      <SearchBar value={search} onChange={setSearch} />
      <div className="flex flex-wrap w-full md:w-auto gap-3 items-center justify-end">
        <FilterSelects
          country={country}
          onCountryChange={onCountryChange}
          department={department}
          onDepartmentChange={onDepartmentChange}
        />
        <button
          onClick={onReset}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors hover:text-white"
          title="Reset Filters"
        >
          <RefreshCcw size={16} />
        </button>
      </div>
    </div>
  );
}
