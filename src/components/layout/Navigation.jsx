import { Home, Users, CalendarClock, Plus, Building2 } from "lucide-react";
import { C } from "../../lib/constants.js";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "businesses", label: "Businesses", icon: Users },
  { id: "followups", label: "Follow-ups", icon: CalendarClock },
];

export function Sidebar({ view, goto, pendingCount }) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 pb-10">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.primary }}>
          <Building2 size={16} color="#fff" />
        </div>
        <span className="font-bold text-[15px]" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>Field CRM</span>
      </div>
      <button
        onClick={() => goto("addBusiness")}
        className="flex items-center justify-center gap-2 mb-6 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition"
        style={{ background: C.clay, color: "#fff", fontFamily: "Inter, sans-serif" }}
      >
        <Plus size={16} /> Add Business
      </button>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => goto(item.id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition"
              style={{ background: active ? C.primarySoft : "transparent", color: active ? C.primary : C.inkSoft }}
            >
              <item.icon size={17} />
              {item.label}
              {item.id === "followups" && pendingCount > 0 && (
                <span className="ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.clay, color: "#fff" }}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav({ view, goto, pendingCount }) {
  const items = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "businesses", label: "Businesses", icon: Users },
    { id: "addVisit", label: "Add Visit", icon: Plus, primary: true },
    { id: "followups", label: "Follow-ups", icon: CalendarClock },
  ];
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-stretch justify-around px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+6px)] z-40"
      style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
    >
      {items.map((item) => {
        const active = view === item.id;
        if (item.primary) {
          return (
            <button key={item.id} onClick={() => goto("addVisit")} className="flex flex-col items-center justify-center -mt-5">
              <span className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition" style={{ background: C.clay }}>
                <Plus size={22} color="#fff" />
              </span>
            </button>
          );
        }
        return (
          <button key={item.id} onClick={() => goto(item.id)} className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 relative">
            <item.icon size={20} style={{ color: active ? C.primary : C.inkFaint }} />
            <span className="text-[10px] font-semibold" style={{ color: active ? C.primary : C.inkFaint }}>{item.label}</span>
            {item.id === "followups" && pendingCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: C.clay, color: "#fff" }}>
                {pendingCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
