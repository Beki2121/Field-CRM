/**
 * Data layer for the Field CRM.
 *
 * PHASE 1 (current): frontend-only, no backend. Everything is persisted to
 * the browser's localStorage, scoped to two keys — "fieldcrm_businesses"
 * and "fieldcrm_visits" — each holding the full collection as one JSON
 * array. This is intentionally simple and fine for personal use up to a
 * few dozen businesses (see RECORD_SOFT_CAP in constants.js).
 *
 * PHASE 2 (when you add a backend + MySQL): every function below keeps the
 * same name and return shape (a Promise resolving to an array, or to
 * true/false for saves). To swap storage engines, only this file needs to
 * change — replace the localStorage calls with `fetch("/api/businesses")`
 * etc. No component needs to know the difference. Example of what that
 * would look like is sketched in the commented-out block at the bottom of
 * this file.
 */

const KEYS = {
  businesses: "fieldcrm_businesses",
  visits: "fieldcrm_visits",
};

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return [];
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
    return false;
  }
}

export async function getBusinesses() {
  return readLocal(KEYS.businesses);
}
export async function saveBusinesses(list) {
  return writeLocal(KEYS.businesses, list);
}
export async function getVisits() {
  return readLocal(KEYS.visits);
}
export async function saveVisits(list) {
  return writeLocal(KEYS.visits, list);
}

/**
 * Exports everything as a single JSON blob — handy for a manual backup, or
 * for migrating this data into a real backend later.
 */
export async function exportAll() {
  const [businesses, visits] = await Promise.all([getBusinesses(), getVisits()]);
  return { businesses, visits, exportedAt: new Date().toISOString() };
}

/* ------------------------------------------------------------------ *
 * PHASE 2 sketch — once you have a backend + MySQL, this file becomes:
 *
 *   const API_BASE = "/api";
 *
 *   export async function getBusinesses() {
 *     const res = await fetch(`${API_BASE}/businesses`, { credentials: "include" });
 *     if (!res.ok) throw new Error("Failed to load businesses");
 *     return res.json();
 *   }
 *
 *   export async function saveBusinesses(list) {
 *     // With a real backend you'd likely switch to per-record
 *     // create/update/delete endpoints instead of saving the whole
 *     // collection each time — this file is the only place that needs
 *     // to change; every component keeps calling getBusinesses/saveBusinesses.
 *     const res = await fetch(`${API_BASE}/businesses`, {
 *       method: "PUT",
 *       headers: { "Content-Type": "application/json" },
 *       credentials: "include",
 *       body: JSON.stringify(list),
 *     });
 *     return res.ok;
 *   }
 *
 *   // ...same pattern for getVisits / saveVisits.
 *
 * Auth (a real login, sessions/JWT, and row-level access control so only
 * you can read your own customer data) belongs in that backend — it can't
 * be done safely in a frontend-only app, which is the main reason this
 * phase-1 version is meant for personal/local use only.
 * ------------------------------------------------------------------ */
