import { CalendarClock, AlertTriangle, Sparkles, Building2, Phone, MessageCircle, Check, Clock } from "lucide-react";
import { C, INTEREST_COLOR } from "../lib/constants.js";
import { waLink, telLink } from "../lib/helpers.js";
import { Card, SectionLabel, EmptyState, IconBtn } from "./ui/Primitives.jsx";

function FollowUpRow({ f, goto, onComplete, onReschedule }) {
  const c = INTEREST_COLOR[f.visit.interestStatus] || {};
  return (
    <div className="flex items-center gap-3 py-3 px-3.5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => goto("profile", f.business.id)}>
        <p className="text-sm font-bold truncate" style={{ color: C.ink }}>{f.business.businessName}</p>
        <p className="text-xs truncate" style={{ color: C.inkFaint }}>
          {f.visit.nextAction} · {f.visit.nextFollowUpMethod || "—"}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {f.business.phone && <IconBtn icon={Phone} label="" href={telLink(f.business.phone)} tone="default" />}
        {f.business.whatsapp && <IconBtn icon={MessageCircle} label="" href={waLink(f.business.whatsapp)} tone="green" />}
        <IconBtn icon={Check} label="" onClick={() => onComplete(f.visit.id)} tone="primary" />
        <IconBtn icon={Clock} label="" onClick={() => onReschedule(f)} tone="clay" />
      </div>
    </div>
  );
}

export default function Dashboard({ businesses, stats, sectorSummary, todayFollowUps, overdueFollowUps, goto, onComplete, onReschedule }) {
  const dateLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>Today's plan</h1>
        <p className="text-sm" style={{ color: C.inkFaint }}>{dateLabel}</p>
      </div>

      {overdueFollowUps.length > 0 && (
        <div>
          <SectionLabel icon={AlertTriangle}>Overdue ({overdueFollowUps.length})</SectionLabel>
          <Card style={{ borderColor: C.red }}>
            {overdueFollowUps.map((f) => (
              <FollowUpRow key={f.visit.id} f={f} goto={goto} onComplete={onComplete} onReschedule={onReschedule} />
            ))}
          </Card>
        </div>
      )}

      <div>
        <SectionLabel icon={CalendarClock}>Today's follow-ups ({todayFollowUps.length})</SectionLabel>
        <Card>
          {todayFollowUps.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing scheduled today" body="Follow-ups you set will show up here on their date." />
          ) : (
            todayFollowUps.map((f) => (
              <FollowUpRow key={f.visit.id} f={f} goto={goto} onComplete={onComplete} onReschedule={onReschedule} />
            ))
          )}
        </Card>
      </div>

      <div>
        <SectionLabel icon={Sparkles}>Quick stats</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Total leads", value: businesses.length, color: C.ink },
            { label: "Interested", value: stats.interested, color: C.green },
            { label: "Maybe", value: stats.maybe, color: C.amber },
            { label: "Customers", value: stats.customers, color: C.blue },
            { label: "Today", value: todayFollowUps.length, color: C.primary },
            { label: "Overdue", value: overdueFollowUps.length, color: C.red },
          ].map((s) => (
            <Card key={s.label} className="p-3.5">
              <p className="text-2xl font-bold" style={{ fontFamily: "IBM Plex Mono, monospace", color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: C.inkFaint }}>{s.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {sectorSummary.length > 0 && (
        <div>
          <SectionLabel icon={Building2}>Sector summary</SectionLabel>
          <Card className="p-4">
            {sectorSummary.map((s) => {
              const max = Math.max(...sectorSummary.map((x) => x.count));
              return (
                <div key={s.sector} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs font-semibold w-32 shrink-0 truncate" style={{ color: C.inkSoft }}>{s.sector}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: C.surfaceAlt }}>
                    <div className="h-2 rounded-full" style={{ width: `${(s.count / max) * 100}%`, background: C.primary }} />
                  </div>
                  <span className="text-xs font-bold w-5 text-right" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.ink }}>{s.count}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
