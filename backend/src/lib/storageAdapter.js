export function toBackendBusiness(item) {
  return {
    id: item.id,
    businessName: item.businessName,
    sector: item.sector,
    contactPerson: item.contactPerson,
    position: item.position ?? null,
    phone: item.phone,
    whatsapp: item.whatsapp ?? null,
    email: item.email ?? null,
    location: item.location ?? null,
    notes: item.notes ?? null,
    status: item.status || "Lead",
    salesStage: item.salesStage || "New Lead",
    sectorFields: item.sectorFields ?? {},
    createdAt: item.createdAt ?? Date.now(),
    updatedAt: item.updatedAt ?? Date.now(),
  };
}

export function toBackendVisit(item) {
  return {
    id: item.id,
    businessId: item.businessId,
    visitDate: item.visitDate,
    contactMethod: item.contactMethod,
    interestStatus: item.interestStatus,
    feedback: item.feedback,
    reason: item.reason ?? null,
    liked: item.liked ?? null,
    objection: item.objection ?? null,
    requestedFeature: item.requestedFeature ?? null,
    nextAction: item.nextAction,
    nextFollowUpDate: item.nextFollowUpDate ?? null,
    nextFollowUpMethod: item.nextFollowUpMethod ?? null,
    notes: item.notes ?? null,
    followUpCompleted: Boolean(item.followUpCompleted),
    createdAt: item.createdAt ?? Date.now(),
  };
}
