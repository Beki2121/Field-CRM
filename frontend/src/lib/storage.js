const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error(
    "VITE_API_URL environment variable is required. App cannot run without backend API.",
  );
}

const LEGACY_KEYS = {
  businesses: ["field_crm_businesses", "crm_businesses"],
  visits: ["field_crm_visits", "crm_visits"],
  bundle: ["field_crm_data", "crm_data", "field_crm_export"],
};

async function jsonFetch(url, options = {}) {
  const fullUrl = `${API_BASE}${url}`;

  const res = await fetch(fullUrl, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = errorText || "Request failed";
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.details || parsed.error || message;
    } catch {
      // keep raw text
    }
    throw new Error(`${res.status}: ${message}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function readLegacyLocalStorage() {
  if (typeof localStorage === "undefined") return null;

  for (const key of LEGACY_KEYS.bundle) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (Array.isArray(data?.businesses)) {
        return {
          businesses: data.businesses,
          visits: Array.isArray(data.visits) ? data.visits : [],
        };
      }
    } catch {
      // try next key
    }
  }

  let businesses = null;
  let visits = [];

  for (const key of LEGACY_KEYS.businesses) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        businesses = parsed;
        break;
      }
    } catch {
      // try next key
    }
  }

  for (const key of LEGACY_KEYS.visits) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        visits = parsed;
        break;
      }
    } catch {
      // try next key
    }
  }

  if (businesses?.length) {
    return { businesses, visits };
  }

  return null;
}

function clearLegacyLocalStorage() {
  if (typeof localStorage === "undefined") return;
  const keys = [
    ...LEGACY_KEYS.businesses,
    ...LEGACY_KEYS.visits,
    ...LEGACY_KEYS.bundle,
  ];
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

export async function migrateFromLocalStorage() {
  const legacy = readLegacyLocalStorage();
  if (!legacy?.businesses?.length) return false;

  await jsonFetch("/api/import", {
    method: "POST",
    body: JSON.stringify(legacy),
  });

  clearLegacyLocalStorage();
  return true;
}

export async function getBusinesses() {
  return jsonFetch("/api/businesses");
}

export async function createBusiness(business) {
  return jsonFetch("/api/businesses", {
    method: "POST",
    body: JSON.stringify(business),
  });
}

export async function saveBusinesses(list) {
  return jsonFetch("/api/businesses", {
    method: "PUT",
    body: JSON.stringify(list),
  });
}

export async function getVisits() {
  return jsonFetch("/api/visits");
}

export async function createVisit(visit) {
  return jsonFetch("/api/visits", {
    method: "POST",
    body: JSON.stringify(visit),
  });
}

export async function saveVisits(list) {
  return jsonFetch("/api/visits", {
    method: "PUT",
    body: JSON.stringify(list),
  });
}

export async function exportAll() {
  const [businesses, visits] = await Promise.all([
    getBusinesses(),
    getVisits(),
  ]);
  return { businesses, visits, exportedAt: new Date().toISOString() };
}

export async function clearAll() {
  return jsonFetch("/api/clear-all", {
    method: "DELETE",
  });
}

export async function deleteBusiness(id) {
  return jsonFetch(`/api/businesses/${id}`, {
    method: "DELETE",
  });
}

export async function deleteVisit(id) {
  return jsonFetch(`/api/visits/${id}`, {
    method: "DELETE",
  });
}
