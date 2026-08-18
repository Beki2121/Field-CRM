/* ---------------------------------------------------------------- */
/* Design tokens                                                     */
/* ---------------------------------------------------------------- */
export const C = {
  bg: "#EFF2EC",
  surface: "#FFFFFF",
  surfaceAlt: "#F6F4EC",
  ink: "#182620",
  inkSoft: "#57655D",
  inkFaint: "#8B978E",
  border: "#DCE2D6",
  borderSoft: "#E9EDE4",
  primary: "#2B5233",
  primaryDark: "#1E3B25",
  primarySoft: "#E3EAE0",
  clay: "#B15A2E",
  claySoft: "#F4E3D6",
  green: "#3C8A5B",
  greenSoft: "#DFF0E6",
  amber: "#C08423",
  amberSoft: "#F8EAD1",
  red: "#BF4B3A",
  redSoft: "#F7E0DC",
  blue: "#3A6790",
  blueSoft: "#E1E9F0",
};

export const INTEREST_COLOR = {
  Interested: { fg: C.green, bg: C.greenSoft, dot: "#3C8A5B" },
  Maybe: { fg: C.amber, bg: C.amberSoft, dot: "#C08423" },
  "Not Interested": { fg: C.red, bg: C.redSoft, dot: "#BF4B3A" },
  "Existing Customer": { fg: C.blue, bg: C.blueSoft, dot: "#3A6790" },
};

/* ---------------------------------------------------------------- */
/* Domain constants                                                   */
/* ---------------------------------------------------------------- */
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

export const SECTOR_FIELDS = {
  Pharmacy: [
    { key: "numProducts", label: "Number of products" },
    { key: "expiryNeed", label: "Expiry management need" },
    { key: "batchNeed", label: "Batch management need" },
    { key: "currentSoftware", label: "Current pharmacy software" },
  ],
  "Cosmetics & Beauty": [
    { key: "brands", label: "Brands carried" },
    { key: "variants", label: "Product variants" },
    { key: "loyaltyNeed", label: "Customer loyalty needs" },
  ],
  "Mini-Market": [
    { key: "numProducts", label: "Number of products" },
    { key: "numBranches", label: "Number of branches" },
    { key: "numCashiers", label: "Number of cashiers" },
    { key: "posUsage", label: "Barcode / POS usage" },
  ],
  Supermarket: [
    { key: "numProducts", label: "Number of products" },
    { key: "numBranches", label: "Number of branches" },
    { key: "numCashiers", label: "Number of cashiers" },
    { key: "posUsage", label: "Barcode / POS usage" },
  ],
  Perfume: [
    { key: "brands", label: "Brands carried" },
    { key: "variants", label: "Product variants" },
  ],
  "Mart / General Retail": [
    { key: "categories", label: "Product categories" },
    { key: "numProducts", label: "Number of products" },
  ],
  Other: [],
};

/* Soft cap as a signal to consider database optimization or pagination 
   when reaching this record count. Data is persisted in MySQL backend. */
export const RECORD_SOFT_CAP = 50;
