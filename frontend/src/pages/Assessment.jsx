import React, { useState, useMemo } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Icon, ICONS } from "../components/Icons";

export function Assessment({
  patients = [],
  assessments = [],
  assessmentForm = { patient_id: "", department: "", symptom: "", severity: "" },
  onAssessmentFormChange,
  onAssessmentSubmit,
  checkEmergency,
}) {
  // Local filtering & sorting state
  const [deptFilter, setDeptFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc"); // Default to newest first

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Process filters and sorting
  const filteredAssessments = useMemo(() => {
    let result = [...assessments];

    // 1. Department Filter
    if (deptFilter) {
      result = result.filter((a) => a.department === deptFilter);
    }

    // 2. Severity Filter
    if (severityFilter) {
      result = result.filter((a) => a.severity?.toLowerCase() === severityFilter.toLowerCase());
    }

    // 3. Text Search (symptom description)
    if (searchText) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (a) =>
          a.symptom?.toLowerCase().includes(query) ||
          String(a.patient_id).includes(query)
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [assessments, deptFilter, severityFilter, searchText, sortField, sortOrder]);

  const sevBadge = (sev) => {
    if (!sev) return null;
    const map = { mild: "badge-mild", moderate: "badge-moderate", severe: "badge-severe" };
    return <span className={`badge ${map[sev.toLowerCase()] || "badge-mild"}`}>{sev}</span>;
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  const getPatientName = (patientId) => {
    const p = patients.find((pat) => pat.id === Number(patientId));
    return p ? p.name : `Patient #${patientId}`;
  };

  const isEmergency = checkEmergency(assessmentForm.symptom);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Assessment Form Card */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader icon={ICONS.assessment} title="Medical Assessment" subtitle="Record patient symptoms and medical evaluation" />
        <form onSubmit={onAssessmentSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Patient</label>
            <select
              id="assess-patient"
              className="field cursor-pointer"
              value={assessmentForm.patient_id}
              onChange={(e) => onAssessmentFormChange({ ...assessmentForm, patient_id: e.target.value })}
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID: {p.id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</label>
            <select
              id="assess-dept"
              className="field cursor-pointer"
              value={assessmentForm.department}
              onChange={(e) => onAssessmentFormChange({ ...assessmentForm, department: e.target.value })}
            >
              <option value="">Select Department</option>
              <option>Orthopedics</option>
              <option>Dermatology</option>
              <option>ENT</option>
              <option>Neurology</option>
              <option>Cardiology</option>
              <option>General Medicine</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Symptom Description</label>
            <input
              id="assess-symptom"
              className="field"
              type="text"
              placeholder="Describe the primary symptom in detail…"
              value={assessmentForm.symptom}
              onChange={(e) => onAssessmentFormChange({ ...assessmentForm, symptom: e.target.value })}
            />
            {assessmentForm.symptom && isEmergency && (
              <p className="text-xs font-semibold mt-1 animate-pulse" style={{ color: "#ef4444" }}>
                ⚠️ Emergency keyword detected — this will trigger an emergency alert
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Severity Level</label>
            <select
              id="assess-severity"
              className="field cursor-pointer"
              value={assessmentForm.severity}
              onChange={(e) => onAssessmentFormChange({ ...assessmentForm, severity: e.target.value })}
            >
              <option value="">Select Severity</option>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button id="save-assessment-btn" type="submit" className="btn-primary w-full justify-center cursor-pointer">
              <Icon d={ICONS.check} size={15} /> Save Assessment
            </button>
          </div>
        </form>
      </div>

      {/* Assessments Records Card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
          <SectionHeader icon={ICONS.activity} title="All Assessments" subtitle={`${filteredAssessments.length} matching records`} />
          
          {/* Filters Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search symptoms */}
            <div className="relative">
              <Icon d={ICONS.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="field pl-8 text-xs"
                style={{ width: 180, padding: "8px 12px 8px 32px" }}
                placeholder="Search symptom or patient..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Department select filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 uppercase font-medium tracking-wider">Dept:</span>
              <select
                className="field text-xs cursor-pointer"
                style={{ width: 140, padding: "6px 20px 6px 8px" }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <option>Orthopedics</option>
                <option>Dermatology</option>
                <option>ENT</option>
                <option>Neurology</option>
                <option>Cardiology</option>
                <option>General Medicine</option>
              </select>
            </div>

            {/* Severity select filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 uppercase font-medium tracking-wider">Severity:</span>
              <select
                className="field text-xs cursor-pointer"
                style={{ width: 110, padding: "6px 20px 6px 8px" }}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            
            {(deptFilter || severityFilter || searchText) && (
              <button
                className="btn-ghost py-1 px-3 text-xs rounded-lg cursor-pointer"
                onClick={() => {
                  setDeptFilter("");
                  setSeverityFilter("");
                  setSearchText("");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {filteredAssessments.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">No assessments recorded yet</p>
        ) : (
          <div className="overflow-auto rounded-xl border border-indigo-950/20">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("id")}>
                    ID{renderSortIndicator("id")}
                  </th>
                  <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("patient_id")}>
                    Patient{renderSortIndicator("patient_id")}
                  </th>
                  <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("department")}>
                    Department{renderSortIndicator("department")}
                  </th>
                  <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("symptom")}>
                    Symptom Description{renderSortIndicator("symptom")}
                  </th>
                  <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("severity")}>
                    Severity{renderSortIndicator("severity")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((a) => (
                  <tr key={a.id}>
                    <td><span className="text-indigo-400 font-mono text-xs">#{a.id}</span></td>
                    <td>{getPatientName(a.patient_id)}</td>
                    <td>
                      <span className="px-2 py-1 rounded-lg text-xs font-medium animate-fade-in-up"
                        style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                        {a.department}
                      </span>
                    </td>
                    <td className="max-w-xs truncate" title={a.symptom}>{a.symptom}</td>
                    <td>{sevBadge(a.severity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
