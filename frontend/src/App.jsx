import { useState, useEffect, Suspense, lazy } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { C } from "./lib/constants.js";
import { useCrmData } from "./hooks/useCrmData.js";
import { Sidebar, MobileNav } from "./components/layout/Navigation.jsx";

const Dashboard = lazy(() => import("./components/Dashboard.jsx"));
const BusinessesList = lazy(() => import("./components/BusinessesList.jsx"));
const AddBusinessForm = lazy(() => import("./components/AddBusinessForm.jsx"));
const AddVisitForm = lazy(() => import("./components/AddVisitForm.jsx"));
const BusinessProfile = lazy(() => import("./components/BusinessProfile.jsx"));
const FollowUpsScreen = lazy(() => import("./components/FollowUpsScreen.jsx"));
const LazyRescheduleModal = lazy(() =>
  import("./components/FollowUpsScreen.jsx").then((m) => ({
    default: m.RescheduleModal,
  })),
);

export default function App() {
  const {
    loading,
    error,
    businesses,
    visitsByBusiness,
    latestVisitFor,
    todayFollowUps,
    overdueFollowUps,
    upcomingFollowUps,
    completedFollowUps,
    stats,
    sectorSummary,
    addBusiness,
    updateBusiness,
    addVisit,
    completeFollowUp,
    rescheduleFollowUp,
    removeBusiness,
    removeVisit,
  } = useCrmData();

  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [prefillBusinessId, setPrefillBusinessId] = useState(null);
  const [toast, setToast] = useState(null);
  const [followUpTab, setFollowUpTab] = useState("today");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const goto = (v, id) => {
    setSelectedId(id || null);
    setView(v);
    window.scrollTo?.(0, 0);
  };

  if (loading) {
    return (
      <div
        className="min-h-[600px] flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <Loader2
          className="animate-spin"
          size={22}
          style={{ color: C.primary }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-[600px] flex flex-col items-center justify-center px-6 text-center"
        style={{ background: C.bg }}
      >
        <AlertCircle size={28} style={{ color: "#d32f2f", marginBottom: 12 }} />
        <h1
          className="text-lg font-bold mb-2"
          style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}
        >
          Could not connect to the database
        </h1>
        <p className="text-sm max-w-md mb-4" style={{ color: C.inkSoft }}>
          {error}
        </p>
        <p className="text-xs max-w-md" style={{ color: C.inkFaint }}>
          Make sure the backend is running and the MySQL schema has been
          imported (run <code>backend/schema.sql</code> on your database).
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: C.primary, color: "#fff" }}
        >
          Retry
        </button>
      </div>
    );
  }

  const selectedBusiness = businesses.find((b) => b.id === selectedId) || null;
  const pendingCount = todayFollowUps.length + overdueFollowUps.length;

  const screenFallback = (
    <div
      className="min-h-[220px] flex items-center justify-center"
      style={{ background: C.bg }}
    >
      <Loader2
        className="animate-spin"
        size={18}
        style={{ color: C.primary }}
      />
    </div>
  );

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="max-w-5xl mx-auto md:flex md:gap-6 md:pt-6">
        <Sidebar view={view} goto={goto} pendingCount={pendingCount} />

        <main className="flex-1 pb-24 md:pb-10 px-4 md:px-0 pt-4 md:pt-0">
          <Suspense fallback={screenFallback}>
            {view === "dashboard" && (
              <Dashboard
                businesses={businesses}
                stats={stats}
                sectorSummary={sectorSummary}
                todayFollowUps={todayFollowUps}
                overdueFollowUps={overdueFollowUps}
                goto={goto}
                onComplete={async (id) => {
                  await completeFollowUp(id);
                  setToast({ text: "Follow-up marked complete." });
                }}
                onReschedule={(f) => setRescheduleTarget(f)}
              />
            )}

            {view === "businesses" && (
              <BusinessesList
                businesses={businesses}
                latestVisitFor={latestVisitFor}
                goto={goto}
                onDelete={removeBusiness}
              />
            )}

            {view === "addBusiness" && (
              <AddBusinessForm
                onCancel={() => goto("dashboard")}
                onSave={async (data) => {
                  try {
                    const b = await addBusiness(data);
                    setToast({ text: `${b.businessName} added.` });
                    setPrefillBusinessId(b.id);
                    goto("addVisit", b.id);
                  } catch (error) {
                    console.error("Error adding business:", error);
                    setToast({
                      text: `Error: ${error.message}`,
                      isError: true,
                    });
                  }
                }}
              />
            )}

            {view === "addVisit" && (
              <AddVisitForm
                businesses={businesses}
                lockedBusinessId={prefillBusinessId}
                defaultBusinessId={selectedId}
                onCancel={() => {
                  setPrefillBusinessId(null);
                  goto(selectedId ? "profile" : "dashboard", selectedId);
                }}
                onSave={async (data) => {
                  try {
                    await addVisit(data);
                    setToast({ text: "Visit recorded successfully." });
                    setPrefillBusinessId(null);
                    goto("profile", data.businessId);
                  } catch (error) {
                    console.error("Error adding visit:", error);
                    setToast({
                      text: `Error: ${error.message}`,
                      isError: true,
                    });
                  }
                }}
              />
            )}

            {view === "profile" && selectedBusiness && (
              <BusinessProfile
                business={selectedBusiness}
                visits={visitsByBusiness[selectedBusiness.id] || []}
                goto={goto}
                onEdit={async (patch) => {
                  try {
                    await updateBusiness(selectedBusiness.id, patch);
                    setToast({ text: "Business updated." });
                  } catch (error) {
                    console.error("Error updating business:", error);
                    setToast({
                      text: `Error: ${error.message}`,
                      isError: true,
                    });
                  }
                }}
                onReschedule={(f) => setRescheduleTarget(f)}
                onDelete={async (id) => {
                  try {
                    await removeBusiness(id);
                    setToast({ text: "Business deleted." });
                    goto("businesses");
                  } catch (error) {
                    console.error("Error deleting business:", error);
                    setToast({
                      text: `Error: ${error.message}`,
                      isError: true,
                    });
                  }
                }}
                onDeleteVisit={async (id) => {
                  try {
                    await removeVisit(id);
                    setToast({ text: "Visit deleted." });
                  } catch (error) {
                    console.error("Error deleting visit:", error);
                    setToast({
                      text: `Error: ${error.message}`,
                      isError: true,
                    });
                  }
                }}
              />
            )}

            {view === "followups" && (
              <FollowUpsScreen
                tab={followUpTab}
                setTab={setFollowUpTab}
                today={todayFollowUps}
                overdue={overdueFollowUps}
                upcoming={upcomingFollowUps}
                completed={completedFollowUps}
                goto={goto}
                onComplete={async (id) => {
                  await completeFollowUp(id);
                  setToast({ text: "Follow-up marked complete." });
                }}
                onReschedule={(f) => setRescheduleTarget(f)}
              />
            )}
          </Suspense>
        </main>
      </div>

      <MobileNav view={view} goto={goto} pendingCount={pendingCount} />

      {toast && (
        <div
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 z-50"
          style={{
            background: toast.isError ? "#d32f2f" : C.primaryDark,
            color: "#fff",
          }}
        >
          {toast.isError ? <AlertCircle size={15} /> : <Check size={15} />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {rescheduleTarget && (
        <Suspense fallback={null}>
          <LazyRescheduleModal
            target={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onSave={async (visitId, payload) => {
              await rescheduleFollowUp(visitId, payload);
              setToast({ text: "Follow-up rescheduled." });
              setRescheduleTarget(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
