import express from "express";
import { pool } from "../db.js";
import { parseJsonColumn } from "../lib/jsonColumn.js";
import {
  BUSINESS_STATUSES,
  SECTORS,
  SALES_STAGES,
  isValidEnum,
} from "../services/validators.js";

export const businessesRouter = express.Router();

const normalizeRecord = (row) => ({
  id: row.id,
  businessName: row.businessName,
  sector: row.sector,
  contactPerson: row.contactPerson,
  position: row.position,
  phone: row.phone,
  whatsapp: row.whatsapp,
  email: row.email,
  location: row.location,
  notes: row.notes,
  status: row.status,
  salesStage: row.salesStage,
  sectorFields: parseJsonColumn(row.sectorFields),
  createdAt: Number(row.createdAt),
  updatedAt: Number(row.updatedAt),
});

businessesRouter.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM businesses ORDER BY updatedAt DESC, createdAt DESC",
    );
    res.json(rows.map(normalizeRecord));
  } catch (error) {
    console.error("GET /api/businesses error:", error);
    const hint =
      error.code === "ER_NO_SUCH_TABLE"
        ? "Database tables missing — run backend/schema.sql on your MySQL database."
        : error.message;
    res.status(500).json({ error: "Failed to load businesses", details: hint });
  }
});

businessesRouter.post("/", async (req, res) => {
  try {
    const payload = req.body ?? {};

    if (
      !payload.businessName ||
      !payload.sector ||
      !payload.contactPerson ||
      !payload.phone
    ) {
      return res.status(400).json({
        error: "Business name, sector, contact person, and phone are required.",
      });
    }

    if (!isValidEnum(payload.sector, SECTORS)) {
      return res.status(400).json({ error: "Invalid sector." });
    }

    if (!isValidEnum(payload.status || "Lead", BUSINESS_STATUSES)) {
      return res.status(400).json({ error: "Invalid business status." });
    }

    if (!isValidEnum(payload.salesStage || "New Lead", SALES_STAGES)) {
      return res.status(400).json({ error: "Invalid sales stage." });
    }

    const id =
      payload.id ||
      `biz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const sectorFields = payload.sectorFields ?? {};

    const [result] = await pool.query(
      `INSERT INTO businesses (
        id, businessName, sector, contactPerson, position, phone, whatsapp, email, location, notes,
        status, salesStage, sectorFields, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
      [
        id,
        String(payload.businessName).trim(),
        payload.sector,
        String(payload.contactPerson).trim(),
        payload.position ?? null,
        String(payload.phone).trim(),
        payload.whatsapp ?? null,
        payload.email ?? null,
        payload.location ?? null,
        payload.notes ?? null,
        payload.status || "Lead",
        payload.salesStage || "New Lead",
        JSON.stringify(sectorFields),
        now,
        now,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM businesses WHERE id = ?", [
      id,
    ]);
    const row = rows[0];
    res.status(201).json(normalizeRecord(row));
  } catch (error) {
    console.error("POST /api/businesses error:", error);
    res.status(500).json({
      error: "Failed to create business",
      details: error.message,
    });
  }
});

businessesRouter.put("/", async (req, res) => {
  try {
    console.log(
      "PUT /api/businesses received with body:",
      JSON.stringify(req.body).substring(0, 200),
    );

    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const next = payload.map((item) => {
      if (!item?.id) throw new Error("Each business requires an id");
      return item;
    });

    console.log(`Processing ${next.length} businesses for upsert`);

    if (!next.length) {
      console.log("No businesses to save");
      return res.json([]);
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert functionality
    for (const item of next) {
      console.log(`Upserting business: ${item.id} - ${item.businessName}`);

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
          String(item.businessName).trim(),
          item.sector,
          String(item.contactPerson).trim(),
          item.position ?? null,
          String(item.phone).trim(),
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

    const [rows] = await pool.query(
      "SELECT * FROM businesses ORDER BY updatedAt DESC",
    );
    console.log(`Returning ${rows.length} businesses after upsert`);
    res.json(rows.map(normalizeRecord));
  } catch (error) {
    console.error("PUT /api/businesses error:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Failed to update businesses", details: error.message });
  }
});

businessesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/businesses/${id}: Deleting business`);

    // Delete all visits for this business first
    const [deleteVisitsResult] = await pool.query(
      "DELETE FROM visits WHERE businessId = ?",
      [id],
    );
    console.log(`  Deleted ${deleteVisitsResult.affectedRows} visits`);

    // Delete the business
    const [deleteBusinessResult] = await pool.query(
      "DELETE FROM businesses WHERE id = ?",
      [id],
    );
    console.log(
      `  Deleted ${deleteBusinessResult.affectedRows} business record`,
    );

    res.json({
      success: true,
      message: `Business and ${deleteVisitsResult.affectedRows} visits deleted`,
    });
  } catch (error) {
    console.error("DELETE /api/businesses/:id error:", error);
    res.status(500).json({ error: "Failed to delete business" });
  }
});
