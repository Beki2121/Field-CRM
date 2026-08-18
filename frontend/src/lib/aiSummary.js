const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error(
    "VITE_API_URL environment variable is required. App cannot run without backend API.",
  );
}

export async function generateSummary(business, visits) {
  if (!business || !business.id) {
    return "Business information is missing.";
  }

  const url = `${API_BASE}/api/ai-summary`;
  console.log("Fetching summary from:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ businessId: business.id }),
  });

  console.log("Summary response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to generate summary:", errorText);
    throw new Error(errorText || "Failed to generate summary");
  }

  const data = await res.json();
  return data.summary || "No visits recorded yet for this business.";
}
