export const SECTORS = [
  "Pharmacy",
  "Cosmetics & Beauty",
  "Mini-Market",
  "Supermarket",
  "Perfume",
  "Mart / General Retail",
  "Other",
];

export const BUSINESS_STATUSES = [
  "Lead",
  "Interested",
  "Maybe",
  "Customer",
  "One-Time Customer",
  "Not Interested",
  "Lost",
];

export const SALES_STAGES = [
  "New Lead",
  "Contacted",
  "Demo Scheduled",
  "Demo Completed",
  "Trial",
  "Negotiation",
  "Ready to Buy",
  "Customer",
  "One-Time Customer",
  "Lost",
  "Not Interested",
];

export const CONTACT_METHODS = [
  "On-site",
  "Phone",
  "WhatsApp",
  "Online",
  "Other",
];
export const INTEREST_STATUSES = [
  "Interested",
  "Maybe",
  "Not Interested",
  "Existing Customer",
];
export const NEXT_ACTIONS = [
  "Call",
  "WhatsApp",
  "Visit",
  "Demo",
  "Send Price",
  "Start Trial",
  "Setup",
  "Follow Up",
  "No Action",
];
export const FOLLOWUP_METHODS = ["On-site", "Phone", "WhatsApp", "Online"];

export function isValidEnum(value, allowed) {
  return typeof value === "string" && allowed.includes(value);
}
