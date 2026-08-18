import { useState } from "react";
import { CalendarClock, Check, Clock } from "lucide-react";
import { C, NEXT_ACTIONS, FOLLOWUP_METHODS } from "../lib/constants.js";
import { fmtDateShort, todayStr } from "../lib/helpers.js";
import { PageHeader, Card, EmptyState, InterestBadge, IconBtn, ModalShell, Field, TextInput, ChipGroup } from "./ui/Primitives.jsx";

export function RescheduleModal({ target, onClose, onSave }) {
  const [date, setDate] = useState(target.visit.nextFollowUpDate || todayStr());
  const [action, setAction] = useState(target.visit.nextAction || "Call");
  const [method, setMethod] = useState(target.visit.nextFollowUpMethod || "Phone");

  return (
    <ModalShell title={`Reschedule — ${target.business.businessName}`} onClose={onClose}>
      <Field label="Next action"><ChipGroup options={NEXT_ACTIONS.filter((a) => a !== "No Action")} value={action} onChange={setAction} columns={3} /></Field>
      <Field label="New follow-up date" required><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} min={todayStr()} /></Field>
      <Field label="Method"><ChipGroup options={FOLLOWUP_METHODS} value={method} onChange={setMethod} columns={4} /></Field>
      <div className="flex gap-2 mt-2">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ background: C.surfaceAlt, color: C.inkSoft }}>Cancel</button>
        <button onClick={() => onSave(target.visit.id, { date, action, method })} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ background: C.primary, color: "#fff" }}>Save</button>
      </div>
    </ModalShell>
  );
}

export default function FollowUpsScreen({ tab, setTab, today, overdue, upcoming, completed, goto, onComplete, onReschedule }) {
  const tabs = [
    { id: "today", label: "Today", data: today },
    { id: "overdue", label: "Overdue", data: overdue },
    { id: "upcoming", label: "Upcoming", data: upcoming },
    { id: "completed", label: "Completed", data: completed },
  ];
  const active = tabs.find((t) => t.id === tab) || tabs[0];

  return (
    <div>
      <PageHeader title="Follow-ups" />
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition"
            style={{ background: tab === t.id ? C.primary : C.surfaceAlt, color: tab === t.id ? "#fff" : C.inkSoft }}
          >
            {t.label} <span className="opacity-70">({t.data.length})</span>
          </button>
        ))}
      </div>

      {active.data.length === 0 ? (
        <Card><EmptyState icon={CalendarClock} title={`No ${active.label.toLowerCase()} follow-ups`} /></Card>
      ) : (
        <div className="space-y-2">
          {active.data.map((f) => (
            <Card key={f.visit.id} className="p-3.5">
              <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => goto("profile", f.business.id)}>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: C.ink }}>{f.business.businessName}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.inkFaint }}>{f.business.sector}</p>
                  {f.visit.feedback && <p className="text-xs mt-1.5 line-clamp-2" style={{ color: C.inkSoft }}>{f.visit.feedback}</p>}
                </div>
                <InterestBadge value={f.visit.interestStatus} />
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                <span className="text-xs font-semibold" style={{ color: C.inkFaint }}>
                  {f.visit.nextAction} · {fmtDateShort(f.visit.nextFollowUpDate)} · {f.visit.nextFollowUpMethod}
                </span>
                {tab !== "completed" && (
                  <div className="flex items-center gap-1.5">
                    <IconBtn icon={Check} label="" tone="primary" onClick={() => onComplete(f.visit.id)} />
                    <IconBtn icon={Clock} label="" tone="clay" onClick={() => onReschedule(f)} />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
