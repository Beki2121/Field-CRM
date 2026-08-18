/**
 * AI customer-summary service.
 *
 * PHASE 1 (current, no backend): a local, deterministic summarizer. It only
 * ever reads facts already recorded on the visits you pass in — it never
 * calls an external API and never invents anything. This satisfies the
 * "optional AI assistant" requirement without needing any secret key in
 * the frontend (an API key should never live in frontend code, since
 * anyone can read it out of the shipped JS bundle).
 *
 * PHASE 2 (when you add a backend): swap the body of `generateSummary`
 * for a call to your own endpoint, e.g.
 *
 *   export async function generateSummary(business, visits) {
 *     const res = await fetch("/api/ai-summary", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       credentials: "include",
 *       body: JSON.stringify({ businessId: business.id }),
 *     });
 *     const data = await res.json();
 *     return data.summary;
 *   }
 *
 * and have that backend route call the Anthropic API server-side (where
 * the API key stays private), passing it only the visit history for that
 * one business, with an instruction not to invent facts — same as this
 * local version does by construction.
 */
export async function generateSummary(business, visits) {
  if (!visits || visits.length === 0) {
    return "No visits recorded yet for this business.";
  }

  const ordered = [...visits].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const latest = ordered[ordered.length - 1];
  const interestedCount = ordered.filter((v) => v.interestStatus === "Interested" || v.interestStatus === "Existing Customer").length;
  const objections = [...new Set(ordered.map((v) => v.objection).filter(Boolean))];
  const likes = [...new Set(ordered.map((v) => v.liked).filter(Boolean))];
  const requests = [...new Set(ordered.map((v) => v.requestedFeature).filter(Boolean))];

  const sentences = [];

  sentences.push(
    `${business.businessName} has had ${ordered.length} interaction${ordered.length === 1 ? "" : "s"} so far, most recently on ${latest.visitDate} (${latest.contactMethod}), with an interest level of "${latest.interestStatus}".`
  );

  if (likes.length) {
    sentences.push(`They responded well to: ${likes.join("; ")}.`);
  }
  if (objections.length) {
    sentences.push(`Main concern raised: ${objections.join("; ")}.`);
  }
  if (requests.length) {
    sentences.push(`They've asked for: ${requests.join("; ")}.`);
  }
  if (interestedCount > 0 && ordered.length > interestedCount) {
    sentences.push(`Interest has been mixed across visits (${interestedCount} of ${ordered.length} logged as interested or an existing customer).`);
  }
  if (latest.nextAction && latest.nextAction !== "No Action") {
    sentences.push(
      `Recommended next move: ${latest.nextAction}${latest.nextFollowUpDate ? ` on ${latest.nextFollowUpDate}` : ""}${latest.nextFollowUpMethod ? ` via ${latest.nextFollowUpMethod}` : ""}, based on what they said last time.`
    );
  }

  return sentences.join(" ");
}
