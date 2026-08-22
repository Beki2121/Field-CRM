import { useState, useMemo, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  C,
  CONTACT_METHODS,
  NEXT_ACTIONS,
  FOLLOWUP_METHODS,
} from "../lib/constants.js";
import { todayStr } from "../lib/helpers.js";
import {
  PageHeader,
  Field,
  TextInput,
  TextArea,
  ChipGroup,
  InterestPicker,
} from "./ui/Primitives.jsx";

export default function AddVisitForm({
  businesses,
  lockedBusinessId,
  defaultBusinessId,
  onSave,
  onCancel,
}) {
  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("field_crm_draft_visit") || "null",
      );
    } catch {
      return null;
    }
  });
  const [businessId, setBusinessId] = useState(
    () => draft?.businessId || lockedBusinessId || defaultBusinessId || "",
  );
  const [search, setSearch] = useState("");
  const [contactMethod, setContactMethod] = useState(
    () => draft?.contactMethod || "On-site",
  );
  const [interestStatus, setInterestStatus] = useState(
    () => draft?.interestStatus || "",
  );
  const [feedback, setFeedback] = useState(() => draft?.feedback || "");
  const [liked, setLiked] = useState(() => draft?.liked || "");
  const [objection, setObjection] = useState(() => draft?.objection || "");
  const [requestedFeature, setRequestedFeature] = useState(
    () => draft?.requestedFeature || "",
  );
  const [nextAction, setNextAction] = useState(() => draft?.nextAction || "");
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    () => draft?.nextFollowUpDate || "",
  );
  const [nextFollowUpMethod, setNextFollowUpMethod] = useState(
    () => draft?.nextFollowUpMethod || "Phone",
  );
  const [notes, setNotes] = useState(() => draft?.notes || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "field_crm_draft_visit",
      JSON.stringify({
        businessId,
        contactMethod,
        interestStatus,
        feedback,
        liked,
        objection,
        requestedFeature,
        nextAction,
        nextFollowUpDate,
        nextFollowUpMethod,
        notes,
      }),
    );
  }, [
    businessId,
    contactMethod,
    interestStatus,
    feedback,
    liked,
    objection,
    requestedFeature,
    nextAction,
    nextFollowUpDate,
    nextFollowUpMethod,
    notes,
  ]);

  const business = businesses.find((b) => b.id === businessId);
  const filteredBusinesses = useMemo(() => {
    if (!search) return businesses;
    const q = search.toLowerCase();
    return businesses.filter(
      (b) =>
        b.businessName.toLowerCase().includes(q) ||
        (b.contactPerson || "").toLowerCase().includes(q),
    );
  }, [businesses, search]);

  const submit = async () => {
    if (!businessId || !interestStatus || !feedback.trim() || !nextAction) {
      setError(
        "Business, interest, a short reason, and next action are required.",
      );
      return;
    }
    if (nextAction !== "No Action" && !nextFollowUpDate) {
      setError("Set a follow-up date, or choose 'No Action'.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        businessId,
        visitDate: todayStr(),
        contactMethod,
        interestStatus,
        feedback: feedback.trim(),
        liked: liked.trim(),
        objection: objection.trim(),
        requestedFeature: requestedFeature.trim(),
        nextAction,
        nextFollowUpDate: nextAction === "No Action" ? "" : nextFollowUpDate,
        nextFollowUpMethod:
          nextAction === "No Action" ? "" : nextFollowUpMethod,
        notes: notes.trim(),
      });
      localStorage.removeItem("field_crm_draft_visit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <PageHeader title="Record a visit" onBack={onCancel} />

      {!lockedBusinessId && (
        <Field label="Business" required>
          {business ? (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: C.primarySoft }}
            >
              <span className="text-sm font-bold" style={{ color: C.primary }}>
                {business.businessName}
              </span>
              <button
                onClick={() => setBusinessId("")}
                className="text-xs font-semibold"
                style={{ color: C.primary }}
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <div className="relative mb-2">
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 12,
                    color: C.inkFaint,
                  }}
                />
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search business or contact"
                  style={{ paddingLeft: 32 }}
                />
              </div>
              <div
                className="max-h-40 overflow-y-auto rounded-xl"
                style={{ border: `1px solid ${C.border}` }}
              >
                {filteredBusinesses.length === 0 && (
                  <p className="text-xs p-3" style={{ color: C.inkFaint }}>
                    No matches.
                  </p>
                )}
                {filteredBusinesses.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setBusinessId(b.id)}
                    className="w-full text-left px-3 py-2 text-sm font-semibold border-b last:border-b-0"
                    style={{ borderColor: C.borderSoft, color: C.ink }}
                  >
                    {b.businessName}{" "}
                    <span className="font-normal" style={{ color: C.inkFaint }}>
                      · {b.sector}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Field>
      )}
      {lockedBusinessId && business && (
        <div
          className="px-3 py-2.5 rounded-xl mb-4"
          style={{ background: C.primarySoft }}
        >
          <span className="text-sm font-bold" style={{ color: C.primary }}>
            {business.businessName}
          </span>
        </div>
      )}

      <Field label="Contact method">
        <ChipGroup
          options={CONTACT_METHODS}
          value={contactMethod}
          onChange={setContactMethod}
          columns={3}
        />
      </Field>

      <Field label="Interest" required>
        <InterestPicker value={interestStatus} onChange={setInterestStatus} />
      </Field>

      <Field label="Why did they say yes / maybe / no?" required>
        <TextArea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Short reason in their words"
        />
      </Field>

      <Field label="What did they like?">
        <TextArea
          value={liked}
          onChange={(e) => setLiked(e.target.value)}
          style={{ minHeight: 52 }}
        />
      </Field>

      <Field label="Main objection / concern">
        <TextArea
          value={objection}
          onChange={(e) => setObjection(e.target.value)}
          style={{ minHeight: 52 }}
        />
      </Field>

      <Field label="Requested feature">
        <TextInput
          value={requestedFeature}
          onChange={(e) => setRequestedFeature(e.target.value)}
        />
      </Field>

      <Field label="Next action" required>
        <ChipGroup
          options={NEXT_ACTIONS}
          value={nextAction}
          onChange={setNextAction}
          columns={3}
        />
      </Field>

      {nextAction && nextAction !== "No Action" && (
        <>
          <Field label="Next follow-up date" required>
            <TextInput
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              min={todayStr()}
            />
          </Field>
          <Field label="Next follow-up method">
            <ChipGroup
              options={FOLLOWUP_METHODS}
              value={nextFollowUpMethod}
              onChange={setNextFollowUpMethod}
              columns={4}
            />
          </Field>
        </>
      )}

      <Field label="Notes">
        <TextArea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ minHeight: 52 }}
        />
      </Field>

      {error && (
        <p className="text-xs font-semibold mb-3" style={{ color: C.red }}>
          {error}
        </p>
      )}

      <div className="flex gap-2 mt-2 sticky bottom-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-bold"
          style={{ background: C.surfaceAlt, color: C.inkSoft }}
        >
          Cancel
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="flex-1 py-3 rounded-xl text-sm font-bold active:scale-95 transition disabled:opacity-50"
          style={{ background: C.primary, color: "#fff" }}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin mx-auto" />
          ) : (
            "Save visit"
          )}
        </button>
      </div>
    </div>
  );
}
