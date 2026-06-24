import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Name or Employee ID..."
        className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-505 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
      />
    </div>
  );
}
