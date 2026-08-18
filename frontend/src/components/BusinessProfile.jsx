import { useState } from "react";
import {
  Plus,
  Phone,
  MessageCircle,
  Clock,
  Pencil,
  User,
  MapPin,
  ClipboardList,
  Sparkles,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  C,
  INTEREST_COLOR,
  SECTORS,
  BUSINESS_STATUSES,
  SALES_STAGES,
  SECTOR_FIELDS,
} from "../lib/constants.js";
import { fmtDate, telLink, waLink, todayStr } from "../lib/helpers.js";
import { generateSummary } from "../lib/aiSummary.js";
import {
  PageHeader,
  Card,
  EmptyState,
  Badge,
  InterestBadge,
  IconBtn,
  Row,
  SectionLabel,
  ModalShell,
  Field,
  TextInput,
  TextArea,
  Select,
} from "./ui/Primitives.jsx";

function PreVisitSummary({ latestVisit }) {
  if (!latestVisit) {
    return (
      <Card
        style={{ background: C.claySoft, borderColor: C.claySoft }}
        className="p-4 mb-5"
      >
        <p
          className="text-xs font-bold uppercase tracking-wide mb-1"
          style={{ color: C.clay }}
        >
          Before you visit
        </p>
        <p className="text-sm" style={{ color: C.ink }}>
          No visits recorded yet. This will be your first contact — record it
          right after.
        </p>
      </Card>
    );
  }
  const isDueToday = latestVisit.nextFollowUpDate === todayStr();
  return (
    <Card
      style={{
        background: C.claySoft,
        border: `1.5px solid ${isDueToday ? C.clay : C.claySoft}`,
      }}
      className="p-4 mb-5"
    >
      <div className="flex items-center justify-between mb-2.5">
        <p
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: C.clay, fontFamily: "Space Grotesk, sans-serif" }}
        >
          Before you visit
        </p>
        {isDueToday && (
          <Badge fg="#fff" bg={C.clay}>
            Due today
          </Badge>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <Row label="Last contact" value={fmtDate(latestVisit.visitDate)} />
        <Row
          label="Interest"
          value={<InterestBadge value={latestVisit.interestStatus} />}
        />
        {latestVisit.feedback && (
          <Row label="Main reason" value={latestVisit.feedback} />
        )}
        {latestVisit.objection && (
          <Row label="Main objection" value={latestVisit.objection} />
        )}
        {latestVisit.liked && (
          <Row label="What they liked" value={latestVisit.liked} />
        )}
        {latestVisit.requestedFeature && (
          <Row label="Last requested" value={latestVisit.requestedFeature} />
        )}
        {latestVisit.nextAction && (
          <Row label="Your next move" value={latestVisit.nextAction} strong />
        )}
        {latestVisit.nextFollowUpDate && (
          <Row
            label="Follow-up"
            value={`${fmtDate(latestVisit.nextFollowUpDate)} — ${latestVisit.nextFollowUpMethod || ""}`}
            strong
          />
        )}
      </div>
    </Card>
  );
}

function AiSummaryBlock({ business, visits }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [summary, setSummary] = useState("");

  const generate = async () => {
    setState("loading");
    try {
      const text = await generateSummary(business, visits);
      setSummary(text);
      setState("done");
    } catch (e) {
      setState("error");
    }
  };

  return (
    <Card className="p-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"
          style={{ color: C.inkFaint, fontFamily: "Space Grotesk, sans-serif" }}
        >
          <Sparkles size={13} /> Customer summary
        </p>
        {state !== "loading" && (
          <button
            onClick={generate}
            className="text-xs font-bold"
            style={{ color: C.primary }}
          >
            {state === "done" ? "Regenerate" : "Generate"}
          </button>
        )}
      </div>
      {state === "idle" && (
        <p className="text-xs" style={{ color: C.inkFaint }}>
          Summarize this business's history in one paragraph, based only on
          recorded visits.
        </p>
      )}
      {state === "loading" && (
        <p
          className="text-xs flex items-center gap-2"
          style={{ color: C.inkFaint }}
        >
          <Loader2 size={13} className="animate-spin" /> Reading visit history…
        </p>
      )}
      {state === "error" && (
        <p className="text-xs" style={{ color: C.red }}>
          Couldn't generate a summary right now. Try again.
        </p>
      )}
      {state === "done" && (
        <p className="text-sm leading-relaxed" style={{ color: C.ink }}>
          {summary}
        </p>
      )}
    </Card>
  );
}

function VisitDetail({ v }) {
  return (
    <div className="pt-2 space-y-1.5 text-sm">
      {v.feedback && <Row label="Reason" value={v.feedback} />}
      {v.liked && <Row label="Liked" value={v.liked} />}
      {v.objection && <Row label="Objection" value={v.objection} />}
      {v.requestedFeature && (
        <Row label="Requested" value={v.requestedFeature} />
      )}
      {v.nextAction && <Row label="Next action" value={v.nextAction} />}
      {v.nextFollowUpDate && (
        <Row
          label="Follow-up"
          value={`${fmtDate(v.nextFollowUpDate)} — ${v.nextFollowUpMethod}`}
        />
      )}
      {v.notes && <Row label="Notes" value={v.notes} />}
    </div>
  );
}

function EditBusinessModal({ business, onClose, onSave }) {
  const [form, setForm] = useState({
    ...business,
    sectorFields: { ...(business.sectorFields || {}) },
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSectorField = (k) => (e) =>
    setForm((f) => ({
      ...f,
      sectorFields: { ...f.sectorFields, [k]: e.target.value },
    }));
  const sectorFieldDefs = SECTOR_FIELDS[form.sector] || [];

  return (
    <ModalShell onClose={onClose} title="Edit business">
      <Field label="Business name" required>
        <TextInput value={form.businessName} onChange={set("businessName")} />
      </Field>
      <Field label="Sector">
        <Select
          value={form.sector}
          onChange={set("sector")}
          options={SECTORS}
        />
      </Field>
      <Field label="Contact person">
        <TextInput value={form.contactPerson} onChange={set("contactPerson")} />
      </Field>
      <Field label="Position">
        <TextInput value={form.position || ""} onChange={set("position")} />
      </Field>
      <Field label="Phone">
        <TextInput value={form.phone} onChange={set("phone")} />
      </Field>
      <Field label="WhatsApp">
        <TextInput value={form.whatsapp || ""} onChange={set("whatsapp")} />
      </Field>
      <Field label="Location">
        <TextInput value={form.location || ""} onChange={set("location")} />
      </Field>
      <Field label="Status">
        <Select
          value={form.status}
          onChange={set("status")}
          options={BUSINESS_STATUSES}
        />
      </Field>
      <Field label="Sales stage">
        <Select
          value={form.salesStage}
          onChange={set("salesStage")}
          options={SALES_STAGES}
        />
      </Field>
      <Field label="Notes">
        <TextArea value={form.notes || ""} onChange={set("notes")} />
      </Field>

      {sectorFieldDefs.length > 0 && (
        <>
          <SectionLabel>{form.sector} details (optional)</SectionLabel>
          {sectorFieldDefs.map((f) => (
            <Field key={f.key} label={f.label}>
              <TextInput
                value={form.sectorFields[f.key] || ""}
                onChange={setSectorField(f.key)}
              />
            </Field>
          ))}
        </>
      )}

      <div className="flex gap-2 mt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl text-sm font-bold"
          style={{ background: C.surfaceAlt, color: C.inkSoft }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="flex-1 py-3 rounded-xl text-sm font-bold"
          style={{ background: C.primary, color: "#fff" }}
        >
          Save changes
        </button>
      </div>
    </ModalShell>
  );
}

export default function BusinessProfile({
  business,
  visits,
  goto,
  onEdit,
  onReschedule,
  onDelete,
  onDeleteVisit,
}) {
  const [expanded, setExpanded] = useState(visits[0]?.id || null);
  const [editing, setEditing] = useState(false);
  const latest = visits[0] || null;
  const sectorFieldDefs = SECTOR_FIELDS[business.sector] || [];

  const handleDeleteBusiness = async () => {
    if (
      !window.confirm(
        `Delete "${business.businessName}" and all its visits? This cannot be undone.`,
      )
    )
      return;
    try {
      await onDelete(business.id);
      goto("businesses");
    } catch (error) {
      alert("Error deleting business: " + error.message);
    }
  };

  return (
    <div className="max-w-lg">
      <PageHeader
        title={business.businessName}
        onBack={() => goto("businesses")}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: C.surfaceAlt }}
            >
              <Pencil size={14} style={{ color: C.ink }} />
            </button>
            <button
              onClick={handleDeleteBusiness}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-95"
              title="Delete business"
              style={{ color: "#d32f2f", background: "#fdecea" }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-2 flex-wrap mb-1">
        <Badge fg={C.inkSoft} bg={C.surfaceAlt}>
          {business.sector}
        </Badge>
        <Badge fg={C.primary} bg={C.primarySoft}>
          {business.status}
        </Badge>
        <Badge fg={C.blue} bg={C.blueSoft}>
          {business.salesStage}
        </Badge>
      </div>
      <p className="text-sm mt-2" style={{ color: C.inkSoft }}>
        <User size={12} className="inline mr-1 -mt-0.5" />
        {business.contactPerson}
        {business.position ? ` · ${business.position}` : ""}
      </p>
      {business.location && (
        <p className="text-sm" style={{ color: C.inkFaint }}>
          <MapPin size={12} className="inline mr-1 -mt-0.5" />
          {business.location}
        </p>
      )}

      <div className="flex flex-wrap gap-2 my-4">
        <IconBtn
          icon={Plus}
          label="Add visit"
          tone="primary"
          onClick={() => goto("addVisit", business.id)}
        />
        {business.phone && (
          <IconBtn icon={Phone} label="Call" href={telLink(business.phone)} />
        )}
        {business.whatsapp && (
          <IconBtn
            icon={MessageCircle}
            label="WhatsApp"
            href={waLink(business.whatsapp)}
            tone="green"
          />
        )}
        {latest && latest.nextFollowUpDate && (
          <IconBtn
            icon={Clock}
            label="Reschedule"
            tone="clay"
            onClick={() => onReschedule({ business, visit: latest })}
          />
        )}
      </div>

      <PreVisitSummary latestVisit={latest} />

      {visits.length > 0 && (
        <AiSummaryBlock business={business} visits={visits} />
      )}

      {sectorFieldDefs.length > 0 &&
        Object.values(business.sectorFields || {}).some(Boolean) && (
          <Card className="p-4 mb-5">
            <SectionLabel>{business.sector} details</SectionLabel>
            <div className="space-y-1.5">
              {sectorFieldDefs
                .filter((f) => business.sectorFields?.[f.key])
                .map((f) => (
                  <Row
                    key={f.key}
                    label={f.label}
                    value={business.sectorFields[f.key]}
                  />
                ))}
            </div>
          </Card>
        )}

      <SectionLabel icon={ClipboardList}>
        Visit history ({visits.length})
      </SectionLabel>
      {visits.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No visits yet"
            body="Record your first visit to start the timeline."
          />
        </Card>
      ) : (
        <div className="space-y-2 mb-4">
          {visits.map((v) => {
            const c = INTEREST_COLOR[v.interestStatus] || {};
            const isOpen = expanded === v.id;
            return (
              <Card
                key={v.id}
                style={{ borderLeft: `3px solid ${c.dot || C.border}` }}
                className="overflow-hidden"
              >
                <button
                  className="w-full text-left p-3.5 flex items-center justify-between gap-2"
                  onClick={() => setExpanded(isOpen ? null : v.id)}
                >
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.ink }}>
                      {fmtDate(v.visitDate)}{" "}
                      <span
                        className="font-normal"
                        style={{ color: C.inkFaint }}
                      >
                        · {v.contactMethod}
                      </span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.inkFaint }}>
                      {v.followUpCompleted
                        ? "Follow-up completed"
                        : v.nextAction
                          ? `Next: ${v.nextAction}`
                          : "Logged"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <InterestBadge value={v.interestStatus} />
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          !window.confirm(
                            "Delete this visit? This cannot be undone.",
                          )
                        )
                          return;
                        try {
                          await onDeleteVisit(v.id);
                        } catch (error) {
                          alert("Error deleting visit: " + error.message);
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-95"
                      style={{ background: "#fdecea" }}
                      title="Delete visit"
                    >
                      <Trash2 size={13} style={{ color: "#d32f2f" }} />
                    </button>
                    <ChevronRight
                      size={15}
                      style={{
                        color: C.inkFaint,
                        transform: isOpen ? "rotate(90deg)" : "none",
                        transition: "transform .15s",
                      }}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                    <div className="px-3.5 pb-3.5">
                      <VisitDetail v={v} />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {editing && (
        <EditBusinessModal
          business={business}
          onClose={() => setEditing(false)}
          onSave={(patch) => {
            onEdit(patch);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
