import express from "express";
import { pool } from "../db.js";

export const summaryRouter = express.Router();

summaryRouter.post("/", async (req, res) => {
  try {
    const { businessId } = req.body ?? {};
    if (!businessId) {
      return res.status(400).json({ error: "businessId is required" });
    }

    const [businessRows] = await pool.query(
      "SELECT * FROM businesses WHERE id = ?",
      [businessId],
    );
    const business = businessRows[0];
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const [visitRows] = await pool.query(
      "SELECT * FROM visits WHERE businessId = ? ORDER BY createdAt ASC",
      [businessId],
    );

    if (!visitRows.length) {
      return res.json({ summary: "No visits recorded yet for this business." });
    }

    const ordered = [...visitRows].sort(
      (a, b) => Number(a.createdAt) - Number(b.createdAt),
    );
    const latest = ordered[ordered.length - 1];
    const interestedCount = ordered.filter(
      (v) =>
        v.interestStatus === "Interested" ||
        v.interestStatus === "Existing Customer",
    ).length;
    const objections = [
      ...new Set(ordered.map((v) => v.objection).filter(Boolean)),
    ];
    const likes = [...new Set(ordered.map((v) => v.liked).filter(Boolean))];
    const requests = [
      ...new Set(ordered.map((v) => v.requestedFeature).filter(Boolean)),
    ];

    const sentences = [
      `${business.businessName} has had ${ordered.length} interaction${ordered.length === 1 ? "" : "s"} so far, most recently on ${latest.visitDate} (${latest.contactMethod}), with an interest level of "${latest.interestStatus}".`,
    ];

    if (likes.length)
      sentences.push(`They responded well to: ${likes.join("; ")}.`);
    if (objections.length)
      sentences.push(`Main concern raised: ${objections.join("; ")}.`);
    if (requests.length)
      sentences.push(`They've asked for: ${requests.join("; ")}.`);
    if (interestedCount > 0 && ordered.length > interestedCount) {
      sentences.push(
        `Interest has been mixed across visits (${interestedCount} of ${ordered.length} logged as interested or an existing customer).`,
      );
    }
    if (latest.nextAction && latest.nextAction !== "No Action") {
      sentences.push(
        `Recommended next move: ${latest.nextAction}${latest.nextFollowUpDate ? ` on ${latest.nextFollowUpDate}` : ""}${latest.nextFollowUpMethod ? ` via ${latest.nextFollowUpMethod}` : ""}, based on what they said last time.`,
      );
    }

    res.json({ summary: sentences.join(" ") });
  } catch (error) {
    console.error("POST /api/ai-summary error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});
