import React from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function FilterSelects({
  country,
  onCountryChange,
  department,
  onDepartmentChange,
}) {
  return (
    <>
      {/* Country filter */}
      <div className="flex items-center gap-1.5 bg-slate-900/40 border border-white/10 rounded-xl px-3 py-1">
        <Filter size={14} className="text-slate-400" />
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="bg-transparent border-0 text-slate-205 text-sm focus:outline-none py-1.5 pr-2"
        >
          <option value="" className="bg-[#0b0f19]">All Countries</option>
          <option value="India" className="bg-[#0b0f19]">India</option>
          <option value="United States" className="bg-[#0b0f19]">United States</option>
          <option value="United Kingdom" className="bg-[#0b0f19]">United Kingdom</option>
          <option value="Germany" className="bg-[#0b0f19]">Germany</option>
        </select>
      </div>

      {/* Department filter */}
      <div className="flex items-center gap-1.5 bg-slate-900/40 border border-white/10 rounded-xl px-3 py-1">
        <SlidersHorizontal size={14} className="text-slate-400" />
        <select
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="bg-transparent border-0 text-slate-205 text-sm focus:outline-none py-1.5 pr-2"
        >
          <option value="" className="bg-[#0b0f19]">All Departments</option>
          <option value="Engineering" className="bg-[#0b0f19]">Engineering</option>
          <option value="Product" className="bg-[#0b0f19]">Product</option>
          <option value="HR" className="bg-[#0b0f19]">HR</option>
          <option value="Sales" className="bg-[#0b0f19]">Sales</option>
          <option value="Marketing" className="bg-[#0b0f19]">Marketing</option>
        </select>
      </div>
    </>
  );
}
