import express from "express";
import { pool } from "../db.js";
import {
  CONTACT_METHODS,
  FOLLOWUP_METHODS,
  INTEREST_STATUSES,
  NEXT_ACTIONS,
  isValidEnum,
} from "../services/validators.js";

export const visitsRouter = express.Router();

const normalizeRecord = (row) => ({
  id: row.id,
  businessId: row.businessId,
  visitDate: row.visitDate,
  contactMethod: row.contactMethod,
  interestStatus: row.interestStatus,
  feedback: row.feedback,
  reason: row.reason,
  liked: row.liked,
  objection: row.objection,
  requestedFeature: row.requestedFeature,
  nextAction: row.nextAction,
  nextFollowUpDate: row.nextFollowUpDate,
  nextFollowUpMethod: row.nextFollowUpMethod,
  notes: row.notes,
  followUpCompleted: Boolean(row.followUpCompleted),
  createdAt: Number(row.createdAt),
});

visitsRouter.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM visits ORDER BY createdAt DESC",
    );
    res.json(rows.map(normalizeRecord));
  } catch (error) {
    console.error("GET /api/visits error:", error);
    res.status(500).json({ error: "Failed to load visits" });
  }
});

visitsRouter.post("/", async (req, res) => {
  try {
    const payload = req.body ?? {};

    if (
      !payload.businessId ||
      !payload.visitDate ||
      !payload.contactMethod ||
      !payload.interestStatus ||
      !payload.feedback ||
      !payload.nextAction
    ) {
      return res.status(400).json({
        error:
          "Business, visit date, contact method, interest, feedback, and next action are required.",
      });
    }

    if (!isValidEnum(payload.contactMethod, CONTACT_METHODS)) {
      return res.status(400).json({ error: "Invalid contact method." });
    }

    if (!isValidEnum(payload.interestStatus, INTEREST_STATUSES)) {
      return res.status(400).json({ error: "Invalid interest status." });
    }

    if (!isValidEnum(payload.nextAction, NEXT_ACTIONS)) {
      return res.status(400).json({ error: "Invalid next action." });
    }

    if (payload.nextAction !== "No Action" && !payload.nextFollowUpDate) {
      return res.status(400).json({
        error:
          "Next follow-up date is required when next action is not 'No Action'.",
      });
    }

    if (
      payload.nextFollowUpMethod &&
      !isValidEnum(payload.nextFollowUpMethod, FOLLOWUP_METHODS)
    ) {
      return res.status(400).json({ error: "Invalid follow-up method." });
    }

    const id =
      payload.id ||
      `visit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = Date.now();

    const [result] = await pool.query(
      `INSERT INTO visits (
        id, businessId, visitDate, contactMethod, interestStatus, feedback, reason, liked, objection,
        requestedFeature, nextAction, nextFollowUpDate, nextFollowUpMethod, notes, followUpCompleted, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.businessId,
        payload.visitDate,
        payload.contactMethod,
        payload.interestStatus,
        String(payload.feedback).trim(),
        payload.reason ?? null,
        payload.liked ?? null,
        payload.objection ?? null,
        payload.requestedFeature ?? null,
        payload.nextAction,
        payload.nextAction === "No Action" ? null : payload.nextFollowUpDate,
        payload.nextAction === "No Action" ? null : payload.nextFollowUpMethod,
        payload.notes ?? null,
        payload.followUpCompleted ? 1 : 0,
        createdAt,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM visits WHERE id = ?", [id]);
    const row = rows[0];
    res.status(201).json(normalizeRecord(row));
  } catch (error) {
    console.error("POST /api/visits error:", error);
    res.status(500).json({ error: "Failed to create visit" });
  }
});

visitsRouter.put("/", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const next = payload.map((item) => {
      if (!item?.id) throw new Error("Each visit requires an id");
      return item;
    });

    if (!next.length) {
      return res.json([]);
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert functionality
    for (const item of next) {
      await pool.query(
        `INSERT INTO visits (
          id, businessId, visitDate, contactMethod, interestStatus, feedback, reason, liked, objection,
          requestedFeature, nextAction, nextFollowUpDate, nextFollowUpMethod, notes, followUpCompleted, createdAt
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
          String(item.feedback).trim(),
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

    const [rows] = await pool.query(
      "SELECT * FROM visits ORDER BY createdAt DESC",
    );
    res.json(rows.map(normalizeRecord));
  } catch (error) {
    console.error("PUT /api/visits error:", error);
    res.status(500).json({ error: "Failed to update visits" });
  }
});

visitsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/visits/${id}: Deleting visit`);

    const [result] = await pool.query("DELETE FROM visits WHERE id = ?", [id]);
    console.log(`  Deleted ${result.affectedRows} visit record`);

    res.json({ success: true, message: "Visit deleted" });
  } catch (error) {
    console.error("DELETE /api/visits/:id error:", error);
    res.status(500).json({ error: "Failed to delete visit" });
  }
});
