import React from "react";
import { Globe } from "lucide-react";

export default function HeadcountList({ headcount }) {
  const distribution = headcount?.distribution || [];

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-violet-400" />
          <h4 className="text-lg font-bold text-white">Headcount by Country</h4>
        </div>
        <div className="space-y-4">
          {distribution.map((item) => (
            <div key={item.country} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-300">{item.country}</span>
                <span className="font-mono text-slate-400">
                  {item.count.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span>Global Distribution Matrix</span>
        <span className="text-indigo-400 font-bold">100% Consolidated</span>
      </div>
    </div>
  );
}
