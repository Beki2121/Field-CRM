export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateShort(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function waLink(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "").replace(/^0/, "251").replace("+", "");
  return `https://wa.me/${digits}`;
}

export function telLink(phone) {
  if (!phone) return null;
  return `tel:${phone.replace(/\s+/g, "")}`;
}
