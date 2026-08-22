import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getBusinesses,
  saveBusinesses,
  getVisits,
  saveVisits,
  createBusiness,
  createVisit,
  deleteBusiness,
  deleteVisit,
  migrateFromLocalStorage,
  syncPendingActions,
  getPendingCount,
} from "../lib/storage.js";
import { uid, todayStr } from "../lib/helpers.js";

export function useCrmData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [visits, setVisits] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        await migrateFromLocalStorage();
      } catch (err) {
        console.warn("Legacy data migration skipped:", err.message);
      }

      const [businessResult, visitResult] = await Promise.allSettled([
        getBusinesses(),
        getVisits(),
      ]);

      if (businessResult.status === "rejected") {
        throw businessResult.reason;
      }

      setBusinesses(businessResult.value);

      if (visitResult.status === "rejected") {
        console.warn("Failed to load visits:", visitResult.reason);
        setVisits([]);
      } else {
        setVisits(visitResult.value);
      }

      return {
        businesses: businessResult.value,
        visits: visitResult.status === "fulfilled" ? visitResult.value : [],
      };
    } catch (err) {
      console.error("Failed to load CRM data:", err);
      setError(err.message || "Failed to connect to the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persistBusinesses = useCallback(async (next) => {
    setBusinesses(next);
    await saveBusinesses(next);
  }, []);
  const persistVisits = useCallback(async (next) => {
    setVisits(next);
    await saveVisits(next);
  }, []);

  const visitsByBusiness = useMemo(() => {
    const map = {};
    for (const v of visits) {
      if (!map[v.businessId]) map[v.businessId] = [];
      map[v.businessId].push(v);
    }
    for (const k in map)
      map[k].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return map;
  }, [visits]);

  const latestVisitFor = useCallback(
    (businessId) => (visitsByBusiness[businessId] || [])[0] || null,
    [visitsByBusiness],
  );

  const pendingFollowUps = useMemo(() => {
    const today = todayStr();
    const list = [];
    for (const b of businesses) {
      const lv = latestVisitFor(b.id);
      if (
        lv &&
        lv.nextFollowUpDate &&
        lv.nextAction !== "No Action" &&
        !lv.followUpCompleted
      ) {
        list.push({
          business: b,
          visit: lv,
          status:
            lv.nextFollowUpDate < today
              ? "overdue"
              : lv.nextFollowUpDate === today
                ? "today"
                : "upcoming",
        });
      }
    }
    list.sort((a, b) =>
      (a.visit.nextFollowUpDate || "").localeCompare(
        b.visit.nextFollowUpDate || "",
      ),
    );
    return list;
  }, [businesses, latestVisitFor]);

  const todayFollowUps = pendingFollowUps.filter((f) => f.status === "today");
  const overdueFollowUps = pendingFollowUps.filter(
    (f) => f.status === "overdue",
  );
  const upcomingFollowUps = pendingFollowUps.filter(
    (f) => f.status === "upcoming",
  );

  const completedFollowUps = useMemo(() => {
    return visits
      .filter((v) => v.followUpCompleted)
      .map((v) => ({
        business: businesses.find((b) => b.id === v.businessId),
        visit: v,
      }))
      .filter((f) => f.business)
      .sort((a, b) => (b.visit.createdAt || 0) - (a.visit.createdAt || 0));
  }, [visits, businesses]);

  const stats = useMemo(() => {
    const s = { leads: 0, interested: 0, maybe: 0, customers: 0 };
    for (const b of businesses) {
      if (b.status === "Lead") s.leads++;
      if (b.status === "Interested") s.interested++;
      if (b.status === "Maybe") s.maybe++;
      if (b.status === "Customer" || b.status === "One-Time Customer")
        s.customers++;
    }
    return s;
  }, [businesses]);

  const sectorSummary = useMemo(() => {
    const map = {};
    for (const b of businesses) map[b.sector] = (map[b.sector] || 0) + 1;
    return Object.entries(map)
      .map(([sector, count]) => ({ sector, count }))
      .filter((s) => s.count > 0);
  }, [businesses]);

  const addBusiness = async (data) => {
    const b = {
      id: uid(),
      status: "Lead",
      salesStage: "New Lead",
      sectorFields: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...data,
    };
    const saved = await createBusiness(b);
    setBusinesses((prev) => [saved, ...prev]);
    return saved;
  };

  const updateBusiness = async (id, patch) => {
    const next = businesses.map((b) =>
      b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b,
    );
    await persistBusinesses(next);
  };

  const updateVisit = async (id, patch) => {
    const next = visits.map((v) => (v.id === id ? { ...v, ...patch } : v));
    await persistVisits(next);
  };

  const addVisit = async (data) => {
    const v = {
      id: uid(),
      createdAt: Date.now(),
      followUpCompleted: false,
      ...data,
    };
    const saved = await createVisit(v);
    setVisits((prev) => [saved, ...prev]);
    const b = businesses.find((x) => x.id === data.businessId);
    if (b) {
      const statusMap = {
        Interested: "Interested",
        Maybe: "Maybe",
        "Not Interested": "Not Interested",
        "Existing Customer": "Customer",
      };
      const patch = {};
      if (
        statusMap[data.interestStatus] &&
        b.status !== "Customer" &&
        b.status !== "One-Time Customer"
      ) {
        patch.status = statusMap[data.interestStatus];
      }
      if (Object.keys(patch).length) await updateBusiness(b.id, patch);
    }
    return saved;
  };

  const completeFollowUp = async (visitId) => {
    const next = visits.map((v) =>
      v.id === visitId ? { ...v, followUpCompleted: true } : v,
    );
    await persistVisits(next);
  };

  const rescheduleFollowUp = async (visitId, { date, action, method }) => {
    const next = visits.map((v) =>
      v.id === visitId
        ? {
            ...v,
            nextFollowUpDate: date,
            nextAction: action,
            nextFollowUpMethod: method,
          }
        : v,
    );
    await persistVisits(next);
  };

  const removeBusiness = async (id) => {
    await deleteBusiness(id);
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    setVisits((prev) => prev.filter((v) => v.businessId !== id));
  };

  const removeVisit = async (id) => {
    await deleteVisit(id);
    setVisits((prev) => prev.filter((v) => v.id !== id));
  };

  const sync = useCallback(async () => {
    const synced = await syncPendingActions();
    const data = await loadData();
    return { ...data, synced, pending: getPendingCount() };
  }, [loadData]);

  return {
    loading,
    error,
    businesses,
    visits,
    visitsByBusiness,
    latestVisitFor,
    todayFollowUps,
    overdueFollowUps,
    upcomingFollowUps,
    completedFollowUps,
    stats,
    sectorSummary,
    addBusiness,
    updateBusiness,
    updateVisit,
    addVisit,
    completeFollowUp,
    rescheduleFollowUp,
    removeBusiness,
    removeVisit,
    sync,
    pendingCount: getPendingCount(),
    reloadData: loadData,
  };
}
