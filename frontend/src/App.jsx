import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Check, AlertCircle, Loader2, Moon, Sun } from "lucide-react";
import { C } from "./lib/constants.js";
import { useCrmData } from "./hooks/useCrmData.js";
import { Sidebar, MobileNav } from "./components/layout/Navigation.jsx";
import { ConfirmDialog } from "./components/ui/Primitives.jsx";

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

function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("field_crm_theme") || "light",
  );
  const [position, setPosition] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("field_crm_theme_position")) || {
          top: 16,
          left: window.innerWidth - 60,
        }
      );
    } catch {
      return { top: 16, left: 16 };
    }
  });
  const drag = useRef(null);
  const moved = useRef(false);
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("field_crm_theme", theme);
  }, [theme]);

  useEffect(() => {
    const move = (event) => {
      if (!drag.current) return;
      moved.current = true;
      setPosition({
        left: Math.max(
          8,
          Math.min(window.innerWidth - 52, event.clientX - drag.current.x),
        ),
        top: Math.max(
          8,
          Math.min(window.innerHeight - 52, event.clientY - drag.current.y),
        ),
      });
    };
    const up = () => {
      if (drag.current) {
        localStorage.setItem(
          "field_crm_theme_position",
          JSON.stringify(positionRef.current),
        );
      }
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title="Drag to move theme switch"
      onPointerDown={(event) => {
        moved.current = false;
        drag.current = {
          x: event.clientX - position.left,
          y: event.clientY - position.top,
        };
      }}
      onClick={() => {
        if (!moved.current) {
          setTheme((value) => {
            const next = value === "dark" ? "light" : "dark";
            document.documentElement.dataset.theme = next;
            return next;
          });
        }
      }}
      className="fixed z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg touch-none"
      style={{
        left: position.left,
        top: position.top,
        background: C.primary,
        color: "#fff",
      }}
    >
      <Icon size={17} />
    </button>
  );
}

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
    updateVisit,
    addVisit,
    completeFollowUp,
    rescheduleFollowUp,
    removeBusiness,
    removeVisit,
    reloadData,
    sync,
  } = useCrmData();

  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [prefillBusinessId, setPrefillBusinessId] = useState(null);
  const [toast, setToast] = useState(null);
  const [followUpTab, setFollowUpTab] = useState("today");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const viewRef = useRef(view);
  const selectedIdRef = useRef(selectedId);
  const allowExit = useRef(false);

  useEffect(() => {
    viewRef.current = view;
    selectedIdRef.current = selectedId;
  }, [view, selectedId]);

  useEffect(() => {
    const dashboardState = { crm: true, view: "dashboard", selectedId: null };
    window.history.replaceState(dashboardState, "", window.location.href);
    const handleBack = (event) => {
      if (allowExit.current) {
        allowExit.current = false;
        return;
      }
      if (viewRef.current !== "dashboard") {
        const nextState = event.state?.crm ? event.state : dashboardState;
        setView(nextState.view);
        setSelectedId(nextState.selectedId || null);
        return;
      }
      window.history.pushState(
        { crm: true, view: "dashboard", selectedId: null },
        "",
        window.location.href,
      );
      setConfirmExit(true);
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener("pwa-update-available", onUpdate);
    return () => window.removeEventListener("pwa-update-available", onUpdate);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const goto = (v, id) => {
    window.history.pushState(
      { crm: true, view: v, selectedId: id || null },
      "",
      window.location.href,
    );
    setSelectedId(id || null);
    setView(v);
    window.scrollTo?.(0, 0);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const data = await sync();
      setToast({
        text: data.synced
          ? `Synced ${data.synced} pending action${data.synced === 1 ? "" : "s"}.`
          : "Already up to date.",
      });
    } catch (error) {
      setToast({ text: `Sync failed: ${error.message}`, isError: true });
    } finally {
      setSyncing(false);
    }
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
  const followUpCount = todayFollowUps.length + overdueFollowUps.length;

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
      <ThemeToggle />
      <div className="max-w-5xl mx-auto md:flex md:gap-6 md:pt-6">
        <Sidebar
          view={view}
          goto={goto}
          pendingCount={followUpCount}
          onSync={handleSync}
          syncing={syncing}
        />

        <main className="flex-1 pb-24 md:pb-10 px-4 md:px-0 pt-4 md:pt-0">
          {updateAvailable && (
            <div
              className="mb-3 px-3 py-2.5 rounded-xl flex items-center justify-between gap-3"
              style={{ background: C.amberSoft, color: C.amber }}
            >
              <span className="text-xs font-semibold">
                A new app version is available. Update to see the latest fixes.
              </span>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                style={{ background: C.amber, color: "#fff" }}
              >
                Update now
              </button>
            </div>
          )}
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
                onUpdateVisit={async (id, patch) => {
                  try {
                    await updateVisit(id, patch);
                    setToast({ text: "Visit updated." });
                  } catch (error) {
                    setToast({
                      text: `Error: ${error.message}`,
                      isError: true,
                    });
                  }
                }}
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

      <MobileNav
        view={view}
        goto={goto}
        pendingCount={followUpCount}
        onSync={handleSync}
        syncing={syncing}
      />

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

      {confirmExit && (
        <ConfirmDialog
          title="Exit Field CRM?"
          message="Are you sure you want to leave the app?"
          confirmLabel="Exit"
          onClose={() => setConfirmExit(false)}
          onConfirm={() => {
            setConfirmExit(false);
            allowExit.current = true;
            window.history.go(-2);
          }}
        />
      )}
    </div>
  );
}

function DeviceAccessGate({ children }) {
  const [allowed, setAllowed] = useState(
    () => localStorage.getItem("field_crm_device_allowed") === "true",
  );
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  if (allowed) return children;

  const submit = (event) => {
    event.preventDefault();
    if (passcode === "4555") {
      localStorage.setItem("field_crm_device_allowed", "true");
      setAllowed(true);
    } else {
      setError("That passcode is not correct.");
      setPasscode("");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: C.bg }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm p-6 rounded-2xl"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <h1
          className="text-xl font-bold mb-2"
          style={{ color: C.ink, fontFamily: "Space Grotesk, sans-serif" }}
        >
          Device access
        </h1>
        <p className="text-sm mb-5" style={{ color: C.inkSoft }}>
          Enter the 4-digit passcode to use Field CRM on this device.
        </p>
        <input
          autoFocus
          inputMode="numeric"
          maxLength={4}
          pattern="[0-9]{4}"
          value={passcode}
          onChange={(event) =>
            setPasscode(event.target.value.replace(/\D/g, ""))
          }
          className="w-full px-3 py-3 rounded-xl text-center text-xl tracking-[0.4em]"
          style={{ border: `1px solid ${C.border}`, color: C.ink }}
        />
        {error && (
          <p className="text-xs font-semibold mt-2" style={{ color: C.red }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full mt-5 py-3 rounded-xl text-sm font-bold"
          style={{ background: C.primary, color: "#fff" }}
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export function ProtectedApp() {
  return (
    <DeviceAccessGate>
      <App />
    </DeviceAccessGate>
  );
}
