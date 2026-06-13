import React, { useEffect } from "react";
import { Icon, ICONS } from "./Icons";

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: { bg: "rgba(16,185,129,0.1)",  border: "#10b981", icon: ICONS.check,  color: "#10b981" },
    error:   { bg: "rgba(239,68,68,0.1)",   border: "#ef4444", icon: ICONS.xmark,  color: "#ef4444" },
    warning: { bg: "rgba(245,158,11,0.1)",  border: "#f59e0b", icon: ICONS.alert,  color: "#f59e0b" },
  };
  const s = styles[type] || styles.success;
  return (
    <div className="fixed top-5 right-5 z-50 animate-fade-in-up flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: s.bg, border: `1px solid ${s.border}`, minWidth: 260, backdropFilter: "blur(12px)" }}>
      <Icon d={s.icon} size={16} style={{ color: s.color, flexShrink: 0 }} />
      <span className="text-sm font-medium text-white">{message}</span>
      <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white cursor-pointer">
        <Icon d={ICONS.xmark} size={14} />
      </button>
    </div>
  );
}
