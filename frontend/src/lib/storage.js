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
const CACHE_KEYS = {
  businesses: "field_crm_cached_businesses",
  visits: "field_crm_cached_visits",
  pending: "field_crm_pending_actions",
};

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isOfflineError(error) {
  return (
    (typeof navigator !== "undefined" && navigator.onLine === false) ||
    error?.name === "TypeError" ||
    /failed to fetch|network/i.test(error?.message || "")
  );
}

function queueAction(action) {
  const pending = readJson(CACHE_KEYS.pending, []);
  pending.push({ ...action, queuedAt: Date.now() });
  writeJson(CACHE_KEYS.pending, pending);
}

async function requestOrQueue(action, fallback) {
  try {
    return await jsonFetch(action.url, action.options);
  } catch (error) {
    if (!isOfflineError(error)) throw error;
    queueAction(action);
    return fallback;
  }
}

function cacheRecords(type, records) {
  writeJson(CACHE_KEYS[type], records);
  return records;
}

async function jsonFetch(url, options = {}) {
  const fullUrl = `${API_BASE}${url}`;

  const res = await fetch(fullUrl, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
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
  try {
    return cacheRecords("businesses", await jsonFetch("/api/businesses"));
  } catch (error) {
    const cached = readJson(CACHE_KEYS.businesses, null);
    if (cached) return cached;
    if (isOfflineError(error)) return [];
    throw error;
  }
}

export async function createBusiness(business) {
  const saved = await requestOrQueue(
    {
      url: "/api/businesses",
      options: {
        method: "POST",
        body: JSON.stringify(business),
      },
    },
    business,
  );
  const businesses = readJson(CACHE_KEYS.businesses, []);
  cacheRecords("businesses", [
    ...businesses.filter((item) => item.id !== saved.id),
    saved,
  ]);
  return saved;
}

export async function saveBusinesses(list) {
  const saved = await requestOrQueue(
    {
      url: "/api/businesses",
      options: {
        method: "PUT",
        body: JSON.stringify(list),
      },
    },
    list,
  );
  cacheRecords("businesses", list);
  return saved;
}

export async function getVisits() {
  try {
    return cacheRecords("visits", await jsonFetch("/api/visits"));
  } catch (error) {
    const cached = readJson(CACHE_KEYS.visits, null);
    if (cached) return cached;
    if (isOfflineError(error)) return [];
    throw error;
  }
}

export async function createVisit(visit) {
  const saved = await requestOrQueue(
    {
      url: "/api/visits",
      options: {
        method: "POST",
        body: JSON.stringify(visit),
      },
    },
    visit,
  );
  const visits = readJson(CACHE_KEYS.visits, []);
  cacheRecords("visits", [
    ...visits.filter((item) => item.id !== saved.id),
    saved,
  ]);
  return saved;
}

export async function saveVisits(list) {
  const saved = await requestOrQueue(
    {
      url: "/api/visits",
      options: {
        method: "PUT",
        body: JSON.stringify(list),
      },
    },
    list,
  );
  cacheRecords("visits", list);
  return saved;
}

export function getPendingCount() {
  return readJson(CACHE_KEYS.pending, []).length;
}

export async function syncPendingActions() {
  const pending = readJson(CACHE_KEYS.pending, []);
  const remaining = [];
  for (const action of pending) {
    try {
      await jsonFetch(action.url, action.options);
    } catch (error) {
      remaining.push(action);
      if (isOfflineError(error)) break;
      throw error;
    }
  }
  writeJson(CACHE_KEYS.pending, remaining);
  return pending.length - remaining.length;
}

export async function exportAll() {
  const [businesses, visits] = await Promise.all([
    getBusinesses(),
    getVisits(),
  ]);
  return { businesses, visits, exportedAt: new Date().toISOString() };
}

export async function deleteBusiness(id) {
  const result = await requestOrQueue(
    {
      url: `/api/businesses/${id}`,
      options: {
        method: "DELETE",
      },
    },
    { success: true, queued: true },
  );
  cacheRecords(
    "businesses",
    readJson(CACHE_KEYS.businesses, []).filter((item) => item.id !== id),
  );
  return result;
}

export async function deleteVisit(id) {
  const result = await requestOrQueue(
    {
      url: `/api/visits/${id}`,
      options: {
        method: "DELETE",
      },
    },
    { success: true, queued: true },
  );
  cacheRecords(
    "visits",
    readJson(CACHE_KEYS.visits, []).filter((item) => item.id !== id),
  );
  return result;
}
