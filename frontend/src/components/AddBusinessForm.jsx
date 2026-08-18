import { useState } from "react";
import { C, SECTORS } from "../lib/constants.js";
import { PageHeader, Field, TextInput, TextArea, Select } from "./ui/Primitives.jsx";

export default function AddBusinessForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ businessName: "", sector: "", contactPerson: "", position: "", phone: "", whatsapp: "", email: "", location: "", notes: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.businessName || !form.sector || !form.contactPerson || !form.phone) {
      setError("Fill in business name, sector, contact person, and phone.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="max-w-md">
      <PageHeader title="Add business" onBack={onCancel} />
      <Field label="Business name" required>
        <TextInput value={form.businessName} onChange={set("businessName")} placeholder="e.g. ABC Pharmacy" autoFocus />
      </Field>
      <Field label="Sector" required>
        <Select value={form.sector} onChange={set("sector")} options={SECTORS} placeholder="Select sector" />
      </Field>
      <Field label="Contact person" required>
        <TextInput value={form.contactPerson} onChange={set("contactPerson")} placeholder="e.g. Abebe Kebede" />
      </Field>
      <Field label="Phone" required>
        <TextInput value={form.phone} onChange={set("phone")} placeholder="09XXXXXXXX" type="tel" />
      </Field>
      <Field label="WhatsApp">
        <TextInput value={form.whatsapp} onChange={set("whatsapp")} placeholder="If different from phone" type="tel" />
      </Field>
      <Field label="Position">
        <TextInput value={form.position} onChange={set("position")} placeholder="e.g. Owner, Manager" />
      </Field>
      <Field label="Location">
        <TextInput value={form.location} onChange={set("location")} placeholder="Area / landmark" />
      </Field>
      <Field label="Notes">
        <TextArea value={form.notes} onChange={set("notes")} placeholder="Anything else worth remembering" />
      </Field>

      {error && <p className="text-xs font-semibold mb-3" style={{ color: C.red }}>{error}</p>}

      <div className="flex gap-2 mt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ background: C.surfaceAlt, color: C.inkSoft }}>Cancel</button>
        <button onClick={submit} className="flex-1 py-3 rounded-xl text-sm font-bold active:scale-95 transition" style={{ background: C.primary, color: "#fff" }}>
          Save & add visit
        </button>
      </div>
    </div>
  );
}
