import React from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Icon, ICONS } from "../components/Icons";

export function PatientHistory({
  patients = [],
  history = [],
  selectedPatientId = "",
  onSelectedPatientChange,
  onLoadHistory,
  onClearHistory,
}) {
  const sevBadge = (sev) => {
    if (!sev) return null;
    const map = { mild: "badge-mild", moderate: "badge-moderate", severe: "badge-severe" };
    return <span className={`badge ${map[sev.toLowerCase()] || "badge-mild"}`}>{sev}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Patient Selector Card */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader
          icon={ICONS.history}
          title="Patient History"
          subtitle="View assessment records for a specific patient"
        />
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Select Patient</label>
            <select
              id="history-patient"
              className="field cursor-pointer"
              value={selectedPatientId}
              onChange={(e) => onSelectedPatientChange(e.target.value)}
            >
              <option value="">Choose a patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID: {p.id})
                </option>
              ))}
            </select>
          </div>
          <button
            id="load-history-btn"
            className="btn-ghost cursor-pointer"
            onClick={() => onLoadHistory(selectedPatientId)}
          >
            <Icon d={ICONS.history} size={15} /> Load History
          </button>
          {history.length > 0 && (
            <button className="btn-ghost cursor-pointer" onClick={onClearHistory}>
              <Icon d={ICONS.xmark} size={15} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* History Records Table Card */}
      {history.length > 0 ? (
        <div className="glass rounded-2xl p-6 animate-fade-in-up">
          <SectionHeader icon={ICONS.activity} title={`History — ${history.length} records`} />
          <div className="overflow-auto rounded-xl border border-indigo-950/20">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Department</th>
                  <th>Symptom</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, i) => (
                  <tr key={item.id}>
                    <td className="text-slate-600 font-mono text-xs">{i + 1}</td>
                    <td>
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                      >
                        {item.department}
                      </span>
                    </td>
                    <td>{item.symptom}</td>
                    <td>{sevBadge(item.severity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.1)",
            }}
          >
            <Icon d={ICONS.history} size={28} />
          </div>
          <p className="text-sm font-medium">No history loaded</p>
          <p className="text-xs mt-1 text-slate-700">Select a patient and click "Load History"</p>
        </div>
      )}
    </div>
  );
}
