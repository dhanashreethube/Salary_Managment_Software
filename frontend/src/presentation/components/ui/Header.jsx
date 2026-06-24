import React from "react";
import { LogOut, User } from "lucide-react";

export default function Header({ onLogout }) {
  return (
    <header className="glass-panel border-x-0 border-t-0 border-b border-white/5 py-4 px-6 md:px-8 relative z-20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-base tracking-wider shadow-md shadow-indigo-500/30">
          Ω
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Onion Salary</h1>
          <span className="text-2xs text-indigo-400 font-mono tracking-widest uppercase">Console v1.0</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium">
          <User size={12} className="text-slate-400" />
          <span>Admin Control Panel</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-semibold transition-all border border-rose-500/20"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
