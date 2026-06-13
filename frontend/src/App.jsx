import { useState, useEffect } from "react";
import axios from "axios";

/* ── Components ────────────────────────────────────────────── */
import { Icon, ICONS } from "./components/Icons";
import { Toast } from "./components/Toast";

/* ── Pages ─────────────────────────────────────────────────── */
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { Assessment } from "./pages/Assessment";
import { AiAnalysis } from "./pages/AiAnalysis";
import { PatientHistory } from "./pages/PatientHistory";

const BASE = "";

export default function App() {
  const [activeTab, setActiveTab]             = useState("dashboard");
  const [patients, setPatients]               = useState([]); // For selectors/stats
  const [paginatedPatients, setPaginatedPatients] = useState([]); // For paginated records
  const [totalPatients, setTotalPatients]     = useState(0);
  const [assessments, setAssessments]         = useState([]);
  const [aiResult, setAiResult]               = useState("");
  const [aiLoading, setAiLoading]             = useState(false);
  const [history, setHistory]                 = useState([]);
  const [historyPatientId, setHistoryPatientId] = useState("");
  const [emergencyAlert, setEmergencyAlert]   = useState("");
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [toast, setToast]                     = useState(null);
  
  // Pagination & search query state for patients
  const [skip, setSkip]                       = useState(0);
  const [limit, setLimit]                     = useState(10);
  const [searchQuery, setSearchQuery]         = useState("");

  const [patientForm, setPatientForm] = useState({ name: "", age: "", gender: "", height: "", weight: "" });
  const [assessmentForm, setAssessmentForm] = useState({ patient_id: "", department: "", symptom: "", severity: "" });

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeToast = () => setToast(null);

  /* ── Data Fetching ─────────────────────────────────────── */
  
  // Fetch ALL patients for selectors/global stats (backend returns plain array)
  const fetchSelectorPatients = async () => {
    try {
      const res = await axios.get(`${BASE}/patients`);
      const list = Array.isArray(res.data) ? res.data : [];
      setPatients(list);
      setTotalPatients(list.length);
    } catch {
      showToast("Failed to load patients list", "error");
    }
  };

  // Fetch patients for the Patients page — filter/paginate on the frontend since backend returns all
  const fetchPaginatedPatients = async (currentSkip = 0, currentLimit = 10, currentSearch = "") => {
    try {
      const res = await axios.get(`${BASE}/patients`);
      let list = Array.isArray(res.data) ? res.data : [];
      // Apply search filter client-side
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        list = list.filter(
          (p) => p.name?.toLowerCase().includes(q) || String(p.id).includes(q)
        );
      }
      setTotalPatients(list.length);
      // Apply pagination client-side
      setPaginatedPatients(list.slice(currentSkip, currentSkip + currentLimit));
    } catch {
      showToast("Failed to load patient list", "error");
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await axios.get(`${BASE}/assessments`);
      setAssessments(res.data);
    } catch {
      showToast("Failed to load assessments", "error");
    }
  };

  const loadHistory = async (patientId) => {
    if (!patientId) {
      showToast("Please select a patient first", "warning");
      return;
    }
    try {
      const res = await axios.get(`${BASE}/patient-history/${patientId}`);
      setHistory(res.data);
      if (res.data.length === 0) {
        showToast("No history found for this patient", "warning");
      } else {
        showToast("History loaded successfully", "success");
      }
    } catch {
      showToast("Failed to load history", "error");
    }
  };

  useEffect(() => {
    fetchSelectorPatients();
    fetchPaginatedPatients(0, limit, "");
    fetchAssessments();
  }, []);

  // Re-fetch paginated view whenever page/limit/search changes
  useEffect(() => {
    fetchPaginatedPatients(skip, limit, searchQuery);
  }, [skip, limit, searchQuery]);

  /* ── Pagination / Search Handlers ────────────────────────── */
  const handlePageChange = (newSkip) => {
    setSkip(newSkip);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSkip(0); // Reset page to first page
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setSkip(0); // Reset page to first page
  };

  /* ── Emergency Detection ───────────────────────────────── */
  const EMERGENCY_KEYWORDS = [
    "chest pain", "difficulty breathing", "heart attack", "stroke",
    "unconscious", "seizure", "severe bleeding", "blood vomiting",
    "anaphylaxis", "cardiac arrest", "choking",
  ];

  const checkEmergency = (symptomText = "") => {
    const lower = symptomText.toLowerCase();
    return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
  };

  /* ── Patient Submit ────────────────────────────────────── */
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.age || !patientForm.gender || !patientForm.height || !patientForm.weight) {
      showToast("Please fill in all patient fields", "warning");
      return;
    }
    try {
      const res = await axios.post(`${BASE}/patients`, {
        ...patientForm,
        age: Number(patientForm.age),
        height: Number(patientForm.height),
        weight: Number(patientForm.weight),
      });
      showToast(`Patient registered! BMI: ${res.data.bmi}`, "success");
      setPatientForm({ name: "", age: "", gender: "", height: "", weight: "" });
      // Refresh both selector list and paginated view
      await fetchSelectorPatients();
      await fetchPaginatedPatients(skip, limit, searchQuery);
    } catch {
      showToast("Failed to register patient", "error");
    }
  };

  /* ── Assessment Submit ─────────────────────────────────── */
  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    if (!assessmentForm.patient_id || !assessmentForm.department || !assessmentForm.symptom || !assessmentForm.severity) {
      showToast("Please fill in all assessment fields", "warning");
      return;
    }
    
    const isEmergency = checkEmergency(assessmentForm.symptom);
    if (isEmergency) {
      setEmergencyAlert("🚨 EMERGENCY DETECTED: This patient requires IMMEDIATE medical attention. Call emergency services now!");
      showToast("Emergency detected! Immediate action required.", "error");
    } else {
      setEmergencyAlert("");
    }
    
    try {
      await axios.post(`${BASE}/assessments`, {
        ...assessmentForm,
        patient_id: Number(assessmentForm.patient_id),
      });
      showToast("Assessment saved successfully", "success");
      setAssessmentForm({ patient_id: "", department: "", symptom: "", severity: "" });
      fetchAssessments();
    } catch {
      showToast("Failed to save assessment", "error");
    }
  };

  /* ── AI Analysis ───────────────────────────────────────── */
  const getAIAnalysis = async () => {
    if (!assessmentForm.department || !assessmentForm.symptom || !assessmentForm.severity) {
      showToast("Please fill department, symptom & severity first", "warning");
      return;
    }
    if (checkEmergency(assessmentForm.symptom)) {
      setEmergencyAlert("🚨 EMERGENCY: Seek immediate medical attention or call emergency services!");
      showToast("Emergency symptom detected — skipping AI analysis", "error");
      return;
    }
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await axios.post(`${BASE}/ai-analysis`, {
        department: assessmentForm.department,
        symptom:    assessmentForm.symptom,
        severity:   assessmentForm.severity,
      });
      setAiResult(res.data.analysis);
      showToast("AI analysis complete", "success");
    } catch {
      showToast("AI analysis failed. Check backend connection.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const navItems = [
    { id: "dashboard",  label: "Dashboard",   icon: ICONS.dashboard  },
    { id: "patients",   label: "Patients",    icon: ICONS.patients   },
    { id: "assessment", label: "Assessment",  icon: ICONS.assessment },
    { id: "ai",         label: "AI Analysis", icon: ICONS.brain      },
    { id: "history",    label: "History",     icon: ICONS.history    },
  ];

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "#0a0b14" }}>
      {/* Toast popup */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* ══════════════════ SIDEBAR ═══════════════════════ */}
      <aside
        className="flex flex-col transition-all duration-300"
        style={{
          width: sidebarOpen ? 240 : 72,
          background: "rgba(15,16,33,0.95)",
          borderRight: "1px solid rgba(99,102,241,0.1)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}
          >
            <Icon d={ICONS.heart} size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-white text-sm leading-none">MediAI</p>
              <p className="text-xs mt-0.5" style={{ color: "#6366f1" }}>
                Medical Triage
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-none cursor-pointer"
              style={{
                ...(activeTab === item.id
                  ? {
                      background: "linear-gradient(90deg,rgba(99,102,241,0.18),rgba(99,102,241,0.04))",
                      borderLeft: "3px solid #6366f1",
                      color: "#818cf8",
                    }
                  : {
                      color: "#4b5280",
                      borderLeft: "3px solid transparent",
                    }),
              }}
            >
              <Icon d={item.icon} size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Status indicator */}
        {sidebarOpen && (
          <div className="p-4 border-t" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 6px #10b981" }} />
              Backend Connected
            </div>
          </div>
        )}

        {/* Toggle Collapse */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-4 rounded-xl p-2 transition-colors cursor-pointer"
          style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <Icon d={ICONS.menu} size={16} />
        </button>
      </aside>

      {/* ══════════════════ MAIN ══════════════════════════ */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            background: "rgba(10,11,20,0.8)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(99,102,241,0.08)",
          }}
        >
          <div>
            <h1 className="text-lg font-bold text-white capitalize">
              {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {emergencyAlert && (
              <span
                className="animate-pulse text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                🚨 EMERGENCY
              </span>
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              MD
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* ═════════ EMERGENCY BANNER ═════════ */}
          {emergencyAlert && (
            <div
              className="rounded-2xl p-4 flex items-start gap-4 animate-fade-in-up"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}
              >
                <Icon d={ICONS.alert} size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-400 text-sm">Emergency Alert</p>
                <p className="text-red-300 text-sm mt-1">{emergencyAlert}</p>
              </div>
              <button
                onClick={() => setEmergencyAlert("")}
                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Icon d={ICONS.xmark} size={16} />
              </button>
            </div>
          )}

          {/* ═══════════ DASHBOARD TAB ══════════ */}
          {activeTab === "dashboard" && (
            <Dashboard
              patients={patients}
              assessments={assessments}
              emergencyAlert={emergencyAlert}
              totalPatientsCount={totalPatients}
            />
          )}

          {/* ═══════════ PATIENTS TAB ════════════ */}
          {activeTab === "patients" && (
            <Patients
              patients={paginatedPatients}
              totalPatients={totalPatients}
              skip={skip}
              limit={limit}
              searchQuery={searchQuery}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              onLimitChange={handleLimitChange}
              patientForm={patientForm}
              onPatientFormChange={setPatientForm}
              onPatientSubmit={handlePatientSubmit}
            />
          )}

          {/* ═══════════ ASSESSMENT TAB ══════════ */}
          {activeTab === "assessment" && (
            <Assessment
              patients={patients}
              assessments={assessments}
              assessmentForm={assessmentForm}
              onAssessmentFormChange={setAssessmentForm}
              onAssessmentSubmit={handleAssessmentSubmit}
              checkEmergency={checkEmergency}
            />
          )}

          {/* ═══════════ AI ANALYSIS TAB ═════════ */}
          {activeTab === "ai" && (
            <AiAnalysis
              assessmentForm={assessmentForm}
              onAssessmentFormChange={setAssessmentForm}
              aiResult={aiResult}
              aiLoading={aiLoading}
              getAIAnalysis={getAIAnalysis}
              onClearResult={() => setAiResult("")}
            />
          )}

          {/* ═══════════ HISTORY TAB ══════════════ */}
          {activeTab === "history" && (
            <PatientHistory
              patients={patients}
              history={history}
              selectedPatientId={historyPatientId}
              onSelectedPatientChange={setHistoryPatientId}
              onLoadHistory={loadHistory}
              onClearHistory={() => setHistory([])}
            />
          )}
        </div>
      </main>
    </div>
  );
}
