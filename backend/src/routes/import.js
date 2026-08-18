import express from "express";
import { pool } from "../db.js";

export const importRouter = express.Router();

importRouter.post("/", async (req, res) => {
  try {
    const { businesses = [], visits = [] } = req.body ?? {};

    if (!Array.isArray(businesses) || !Array.isArray(visits)) {
      return res.status(400).json({
        error: "Expected { businesses: [], visits: [] }",
      });
    }

    for (const item of businesses) {
      if (!item?.id) continue;
      await pool.query(
        `INSERT INTO businesses (
          id, businessName, sector, contactPerson, position, phone, whatsapp, email, location, notes,
          status, salesStage, sectorFields, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          businessName = VALUES(businessName),
          sector = VALUES(sector),
          contactPerson = VALUES(contactPerson),
          position = VALUES(position),
          phone = VALUES(phone),
          whatsapp = VALUES(whatsapp),
          email = VALUES(email),
          location = VALUES(location),
          notes = VALUES(notes),
          status = VALUES(status),
          salesStage = VALUES(salesStage),
          sectorFields = VALUES(sectorFields),
          updatedAt = VALUES(updatedAt)`,
        [
          item.id,
          String(item.businessName || "").trim(),
          item.sector,
          String(item.contactPerson || "").trim(),
          item.position ?? null,
          String(item.phone || "").trim(),
          item.whatsapp ?? null,
          item.email ?? null,
          item.location ?? null,
          item.notes ?? null,
          item.status || "Lead",
          item.salesStage || "New Lead",
          JSON.stringify(item.sectorFields ?? {}),
          item.createdAt || Date.now(),
          item.updatedAt || Date.now(),
        ],
      );
    }

    for (const item of visits) {
      if (!item?.id) continue;
      await pool.query(
        `INSERT INTO visits (
          id, businessId, visitDate, contactMethod, interestStatus, feedback, reason, liked,
          objection, requestedFeature, nextAction, nextFollowUpDate, nextFollowUpMethod, notes,
          followUpCompleted, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          businessId = VALUES(businessId),
          visitDate = VALUES(visitDate),
          contactMethod = VALUES(contactMethod),
          interestStatus = VALUES(interestStatus),
          feedback = VALUES(feedback),
          reason = VALUES(reason),
          liked = VALUES(liked),
          objection = VALUES(objection),
          requestedFeature = VALUES(requestedFeature),
          nextAction = VALUES(nextAction),
          nextFollowUpDate = VALUES(nextFollowUpDate),
          nextFollowUpMethod = VALUES(nextFollowUpMethod),
          notes = VALUES(notes),
          followUpCompleted = VALUES(followUpCompleted)`,
        [
          item.id,
          item.businessId,
          item.visitDate,
          item.contactMethod,
          item.interestStatus,
          item.feedback ?? null,
          item.reason ?? null,
          item.liked ?? null,
          item.objection ?? null,
          item.requestedFeature ?? null,
          item.nextAction,
          item.nextAction === "No Action" ? null : item.nextFollowUpDate,
          item.nextAction === "No Action" ? null : item.nextFollowUpMethod,
          item.notes ?? null,
          item.followUpCompleted ? 1 : 0,
          item.createdAt || Date.now(),
        ],
      );
    }

    res.json({
      success: true,
      imported: { businesses: businesses.length, visits: visits.length },
    });
  } catch (error) {
    console.error("POST /api/import error:", error);
    res.status(500).json({
      error: "Failed to import data",
      details: error.message,
    });
  }
});
