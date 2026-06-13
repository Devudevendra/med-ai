import React, { useState, useMemo } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Icon, ICONS } from "../components/Icons";

export function Patients({
  patients = [],
  totalPatients = 0,
  skip = 0,
  limit = 10,
  searchQuery = "",
  onPageChange,
  onSearchChange,
  onLimitChange,
  patientForm = { name: "", age: "", gender: "", height: "", weight: "" },
  onPatientFormChange,
  onPatientSubmit,
}) {
  // Local sorting state
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort patients locally on the current page slice for responsive rendering
  const sortedPatients = useMemo(() => {
    const list = [...patients];
    return list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      // Handle string comparisons
      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle number comparisons
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [patients, sortField, sortOrder]);

  // Pagination helper calculations
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(totalPatients / limit) || 1;
  const startRecord = totalPatients === 0 ? 0 : skip + 1;
  const endRecord = Math.min(skip + limit, totalPatients);

  // Status badges
  const bmiBadge = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return <span className="badge" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>Underweight</span>;
    if (bmi < 25)   return <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Normal</span>;
    if (bmi < 30)   return <span className="badge" style={{ background: "rgba(245,158,11,0.15)",  color: "#f59e0b" }}>Overweight</span>;
    return                  <span className="badge badge-severe">Obese</span>;
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Registration Form Card */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader icon={ICONS.plus} title="Register New Patient" subtitle="Enter patient demographic information" />
        <form onSubmit={onPatientSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
            <input
              id="patient-name"
              className="field"
              type="text"
              placeholder="e.g. John Doe"
              value={patientForm.name}
              onChange={(e) => onPatientFormChange({ ...patientForm, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Age</label>
            <input
              id="patient-age"
              className="field"
              type="number"
              min="0"
              max="150"
              placeholder="e.g. 34"
              value={patientForm.age}
              onChange={(e) => onPatientFormChange({ ...patientForm, age: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gender</label>
            <select
              id="patient-gender"
              className="field"
              value={patientForm.gender}
              onChange={(e) => onPatientFormChange({ ...patientForm, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Height (cm)</label>
            <input
              id="patient-height"
              className="field"
              type="number"
              min="0"
              placeholder="e.g. 172"
              value={patientForm.height}
              onChange={(e) => onPatientFormChange({ ...patientForm, height: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Weight (kg)</label>
            <input
              id="patient-weight"
              className="field"
              type="number"
              min="0"
              placeholder="e.g. 68"
              value={patientForm.weight}
              onChange={(e) => onPatientFormChange({ ...patientForm, weight: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button id="register-patient-btn" type="submit" className="btn-primary w-full justify-center cursor-pointer">
              <Icon d={ICONS.plus} size={15} />
              Register Patient
            </button>
          </div>
        </form>
      </div>

      {/* Patient Records Card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <SectionHeader icon={ICONS.patients} title="Registered Patients" subtitle={`${totalPatients} total records`} />
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Icon d={ICONS.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="patient-search"
                className="field pl-8 text-xs"
                style={{ width: 220, padding: "8px 12px 8px 32px" }}
                placeholder="Search database by name…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Page Limit Select */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 uppercase font-medium tracking-wider">Page Size:</span>
              <select
                className="field text-xs cursor-pointer"
                style={{ width: 70, padding: "6px 20px 6px 8px" }}
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {sortedPatients.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">No patients found matching your search</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-auto rounded-xl border border-indigo-950/20">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("id")}>
                      ID{renderSortIndicator("id")}
                    </th>
                    <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("name")}>
                      Name{renderSortIndicator("name")}
                    </th>
                    <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("age")}>
                      Age{renderSortIndicator("age")}
                    </th>
                    <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("gender")}>
                      Gender{renderSortIndicator("gender")}
                    </th>
                    <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("height")}>
                      Height{renderSortIndicator("height")}
                    </th>
                    <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("weight")}>
                      Weight{renderSortIndicator("weight")}
                    </th>
                    <th className="cursor-pointer select-none hover:text-indigo-400" onClick={() => handleSort("bmi")}>
                      BMI{renderSortIndicator("bmi")}
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPatients.map((p) => (
                    <tr key={p.id}>
                      <td><span className="text-indigo-400 font-mono text-xs">#{p.id}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{p.name}</span>
                        </div>
                      </td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                      <td>{p.height} cm</td>
                      <td>{p.weight} kg</td>
                      <td className="font-semibold text-white">{p.bmi}</td>
                      <td>{bmiBadge(p.bmi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-indigo-950/20 text-xs">
              <span className="text-slate-400">
                Showing <strong className="text-white">{startRecord}</strong> to{" "}
                <strong className="text-white">{endRecord}</strong> of{" "}
                <strong className="text-white">{totalPatients}</strong> patients
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  className="btn-ghost py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange(skip - limit)}
                >
                  <Icon d="M15 18l-6-6 6-6" size={14} /> Previous
                </button>
                
                <span className="text-slate-400 font-medium px-2">
                  Page <strong className="text-white">{currentPage}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong>
                </span>

                <button
                  className="btn-ghost py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange(skip + limit)}
                >
                  Next <Icon d="M9 18l6-6-6-6" size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
