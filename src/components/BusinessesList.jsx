import { useState, useMemo } from "react";
import { Search, Filter, Plus, Users } from "lucide-react";
import { C, SECTORS, BUSINESS_STATUSES, RECORD_SOFT_CAP } from "../lib/constants.js";
import { fmtDateShort } from "../lib/helpers.js";
import { PageHeader, Card, EmptyState, InterestBadge, TextInput, Select } from "./ui/Primitives.jsx";

export default function BusinessesList({ businesses, latestVisitFor, goto }) {
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (sectorFilter && b.sector !== sectorFilter) return false;
      if (statusFilter && b.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!(b.businessName.toLowerCase().includes(q) || (b.contactPerson || "").toLowerCase().includes(q) || (b.phone || "").includes(q))) return false;
      }
      return true;
    });
  }, [businesses, query, sectorFilter, statusFilter]);

  const nearCap = businesses.length >= RECORD_SOFT_CAP - 5;

  return (
    <div>
      <PageHeader title={`Businesses (${businesses.length})`} right={
        <button onClick={() => goto("addBusiness")} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.clay }}>
          <Plus size={16} color="#fff" />
        </button>
      } />

      {nearCap && (
        <div className="text-xs font-semibold px-3 py-2 rounded-xl mb-3" style={{ background: C.amberSoft, color: C.amber }}>
          {businesses.length}/{RECORD_SOFT_CAP} businesses stored locally on this device. Consider moving to a backend + database soon so your data isn't tied to one browser.
        </div>
      )}

      <div className="relative mb-2.5">
        <Search size={15} style={{ position: "absolute", left: 11, top: 12, color: C.inkFaint }} />
        <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, contact, or phone" style={{ paddingLeft: 32 }} />
      </div>

      <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-1.5 text-xs font-bold mb-3" style={{ color: C.primary }}>
        <Filter size={13} /> Filters {(sectorFilter || statusFilter) && "· active"}
      </button>

      {showFilters && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} options={SECTORS} placeholder="All sectors" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={BUSINESS_STATUSES} placeholder="All statuses" />
        </div>
      )}

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Users} title="No businesses found" body="Try a different search, or add a new business." /></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => {
            const lv = latestVisitFor(b.id);
            return (
              <Card key={b.id} className="p-3.5 cursor-pointer active:scale-[0.99] transition">
                <div onClick={() => goto("profile", b.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: C.ink }}>{b.businessName}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.inkFaint }}>{b.sector} · {b.contactPerson}</p>
                    </div>
                    {lv && <InterestBadge value={lv.interestStatus} />}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: C.inkFaint }}>
                    <span>Last visit: {lv ? fmtDateShort(lv.visitDate) : "—"}</span>
                    {lv && lv.nextFollowUpDate && !lv.followUpCompleted && (
                      <span className="font-semibold" style={{ color: C.clay }}>Next: {fmtDateShort(lv.nextFollowUpDate)}</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
