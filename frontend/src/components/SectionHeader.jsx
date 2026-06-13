import React from "react";
import { Icon } from "./Icons";

export function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
        <Icon d={icon} size={16} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
