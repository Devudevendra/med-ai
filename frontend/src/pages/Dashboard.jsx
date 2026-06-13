import React from "react";
import { StatCard } from "../components/StatCard";
import { SectionHeader } from "../components/SectionHeader";
import { Icon, ICONS } from "../components/Icons";

export function Dashboard({ patients = [], assessments = [], emergencyAlert, totalPatientsCount = 0 }) {
  // ── Stats Calculations ──────────────────────────────────────────────────────
  const totalAssessments = assessments.length;
  const activeDepartments = [...new Set(assessments.map((a) => a.department))].filter(Boolean).length;
  const activeEmergencies = emergencyAlert ? 1 : 0;

  // 1. Severity stats
  const severityCounts = assessments.reduce(
    (acc, cur) => {
      const sev = cur.severity?.toLowerCase();
      if (sev === "mild") acc.mild += 1;
      else if (sev === "moderate") acc.moderate += 1;
      else if (sev === "severe") acc.severe += 1;
      return acc;
    },
    { mild: 0, moderate: 0, severe: 0 }
  );

  // 2. BMI Category stats
  const bmiCounts = patients.reduce(
    (acc, cur) => {
      const bmi = cur.bmi;
      if (!bmi) return acc;
      if (bmi < 18.5) acc.underweight += 1;
      else if (bmi < 25) acc.normal += 1;
      else if (bmi < 30) acc.overweight += 1;
      else acc.obese += 1;
      return acc;
    },
    { underweight: 0, normal: 0, overweight: 0, obese: 0 }
  );

  // 3. Department workload stats
  const deptList = ["Orthopedics", "Dermatology", "ENT", "Neurology", "Cardiology", "General Medicine"];
  const deptCounts = deptList.map((dept) => {
    const count = assessments.filter((a) => a.department === dept).length;
    const pct = totalAssessments ? Math.round((count / totalAssessments) * 100) : 0;
    return { name: dept, count, pct };
  });

  // ── Donut Chart Calculations (Severity) ───────────────────────────────────
  const severityTotal = severityCounts.mild + severityCounts.moderate + severityCounts.severe;
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16

  const getDonutSegments = () => {
    if (severityTotal === 0) return [];
    
    let currentOffset = 0;
    return [
      { key: "mild", val: severityCounts.mild, color: "#10b981", label: "Mild" },
      { key: "moderate", val: severityCounts.moderate, color: "#f59e0b", label: "Moderate" },
      { key: "severe", val: severityCounts.severe, color: "#ef4444", label: "Severe" },
    ].map((seg) => {
      const pct = (seg.val / severityTotal) * 100;
      const strokeLength = (pct / 100) * circumference;
      const strokeOffset = circumference - strokeLength + currentOffset;
      // SVG strokeOffset moves backward, so we adjust currentOffset to stack
      currentOffset -= strokeLength;
      return {
        ...seg,
        pct: Math.round(pct),
        strokeDasharray: `${strokeLength} ${circumference - strokeLength}`,
        strokeDashoffset: strokeOffset,
      };
    });
  };

  const donutSegments = getDonutSegments();

  // Badges helper
  const bmiBadge = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return <span className="badge" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>Underweight</span>;
    if (bmi < 25)   return <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Normal</span>;
    if (bmi < 30)   return <span className="badge" style={{ background: "rgba(245,158,11,0.15)",  color: "#f59e0b" }}>Overweight</span>;
    return                  <span className="badge badge-severe">Obese</span>;
  };

  const sevBadge = (sev) => {
    if (!sev) return null;
    const map = { mild: "badge-mild", moderate: "badge-moderate", severe: "badge-severe" };
    return <span className={`badge ${map[sev.toLowerCase()] || "badge-mild"}`}>{sev}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Stats Row */}
      <div className="flex gap-4 flex-wrap">
        <StatCard label="Total Patients" value={totalPatientsCount} icon={ICONS.patients} color="indigo" sub="Registered" />
        <StatCard label="Assessments" value={totalAssessments} icon={ICONS.assessment} color="emerald" sub="Completed" />
        <StatCard label="Departments" value={activeDepartments} icon={ICONS.stethoscope} color="amber" sub="Active" />
        <StatCard label="Emergency Alerts" value={activeEmergencies} icon={ICONS.alert} color="rose" sub="Active" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Chart 1: Severity distribution (Donut Chart) */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[340px]">
          <SectionHeader icon={ICONS.activity} title="Triage Severity" subtitle="Ratio of clinical severity levels" />
          
          {severityTotal === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              No severity metrics available
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
              {/* Donut SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 120 120" className="-rotate-90">
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.key}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                      className="cursor-pointer hover:opacity-85"
                    />
                  ))}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white">{severityTotal}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Cases</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-col gap-2">
                {donutSegments.map((seg) => (
                  <div key={seg.key} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">{seg.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{seg.val} cases ({seg.pct}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: BMI Distribution Bar Chart */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[340px]">
          <SectionHeader icon={ICONS.heart} title="Patient BMI Breakdown" subtitle="Health indicators distribution" />
          
          {patients.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              No BMI data available
            </div>
          ) : (
            <div className="space-y-4 my-2 flex-1 flex flex-col justify-center">
              {[
                { label: "Underweight (< 18.5)", count: bmiCounts.underweight, color: "linear-gradient(90deg, #3b82f6, #60a5fa)", pct: patients.length ? Math.round((bmiCounts.underweight / patients.length) * 100) : 0 },
                { label: "Normal (18.5 - 24.9)", count: bmiCounts.normal, color: "linear-gradient(90deg, #10b981, #34d399)", pct: patients.length ? Math.round((bmiCounts.normal / patients.length) * 100) : 0 },
                { label: "Overweight (25 - 29.9)", count: bmiCounts.overweight, color: "linear-gradient(90deg, #f59e0b, #fbbf24)", pct: patients.length ? Math.round((bmiCounts.overweight / patients.length) * 100) : 0 },
                { label: "Obese (≥ 30)", count: bmiCounts.obese, color: "linear-gradient(90deg, #ef4444, #f87171)", pct: patients.length ? Math.round((bmiCounts.obese / patients.length) * 100) : 0 },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-semibold">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-900 border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 3: Department Workloads Progress Bars */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[340px]">
          <SectionHeader icon={ICONS.stethoscope} title="Department Case Volumes" subtitle="Active triages by medical department" />
          
          {totalAssessments === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              No department workload logs
            </div>
          ) : (
            <div className="space-y-3 my-1 overflow-y-auto max-h-[200px] pr-1">
              {deptCounts.map((dept, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 truncate">{dept.name}</span>
                    <span className="text-white font-semibold flex-shrink-0">{dept.count} cases</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dept.pct}%`,
                        background: "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick overview grid (Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Patients */}
        <div className="glass rounded-2xl p-5">
          <SectionHeader icon={ICONS.patients} title="Recent Patients" subtitle="Latest registered patient entries" />
          {patients.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No patients registered yet</p>
          ) : (
            <div className="space-y-3">
              {patients.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.08)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.age}y · {p.gender} · BMI {p.bmi}</p>
                  </div>
                  {bmiBadge(p.bmi)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assessments */}
        <div className="glass rounded-2xl p-5">
          <SectionHeader icon={ICONS.activity} title="Recent Assessments" subtitle="Latest medical evaluations logged" />
          {assessments.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No assessments yet</p>
          ) : (
            <div className="space-y-3">
              {assessments.slice(-5).reverse().map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.08)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                    <Icon d={ICONS.assessment} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{a.symptom}</p>
                    <p className="text-xs text-slate-500">{a.department} · Patient #{a.patient_id}</p>
                  </div>
                  {sevBadge(a.severity)}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
