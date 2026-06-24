import React from "react";

export default function MetricCard({ title, value, subtitle, icon, glowColor = "bg-indigo-500/10" }) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 ${glowColor} rounded-full blur-2xl -mr-6 -mt-6`}></div>
      <div>
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <h3 className="text-3xl font-bold tracking-tight text-white mt-1">
          {value}
        </h3>
        {typeof subtitle === "string" ? (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        ) : (
          subtitle
        )}
      </div>
      {icon}
    </div>
  );
}
