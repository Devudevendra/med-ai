import React from "react";
import { Icon } from "./Icons";

export function StatCard({ label, value, icon, color, sub }) {
  const colors = {
    indigo: { ring: "rgba(99,102,241,0.2)", glow: "rgba(99,102,241,0.12)", icon: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    emerald:{ ring: "rgba(16,185,129,0.2)",  glow: "rgba(16,185,129,0.12)",  icon: "#10b981", bg: "rgba(16,185,129,0.1)" },
    rose:   { ring: "rgba(239,68,68,0.2)",   glow: "rgba(239,68,68,0.12)",   icon: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
    amber:  { ring: "rgba(245,158,11,0.2)",  glow: "rgba(245,158,11,0.12)",  icon: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="glass glass-hover rounded-2xl p-5 animate-fade-in-up flex-1 min-w-[180px]"
      style={{ boxShadow: `0 0 24px ${c.glow}` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: c.bg, color: c.icon }}>
          <Icon d={icon} size={18} />
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full"
          style={{ background: c.bg, color: c.icon }}>{sub}</span>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{label}</p>
    </div>
  );
}
