/**
 * committees.ts
 * Canonical mapping of committee IDs to human-readable names.
 *
 * Prefixes:
 *   J  = Joint Committee on …
 *   S  = Senate Committee on …
 *   H  = House Committee on …
 */

export const COMMITTEE_NAMES: Record<string, string> = {
  // ── Joint Committees ───────────────────────────────────────────────────────
  J10: "Municipalities and Regional Government",
  J11: "Financial Services",
  J12: "Economic Development and Emerging Technologies",
  J13: "Children, Families and Persons with Disabilities",
  J14: "Education",
  J15: "Election Laws",
  J16: "Public Health",
  J17: "Consumer Protection and Professional Licensure",
  J18: "Mental Health, Substance Use and Recovery",
  J19: "the Judiciary",
  J21: "Environment and Natural Resources",
  J22: "Public Safety and Homeland Security",
  J23: "Public Service",
  J24: "Health Care Financing",
  J25: "State Administration and Regulatory Oversight",
  J26: "Revenue",
  J27: "Transportation",
  J28: "Housing",
  J29: "Higher Education",
  J30: "Tourism, Arts and Cultural Development",
  J31: "Veterans and Federal Affairs",
  J32: "Bonding, Capital Expenditures and State Assets",
  J33: "Advanced Information Technology, the Internet and Cybersecurity",
  J34: "Racial Equity, Civil Rights, and Inclusion",
  J37: "Telecommunications, Utilities and Energy",
  J39: "Ways and Means",
  J40: "Rules",
  J43: "Labor and Workforce Development",
  J45: "Agriculture and Fisheries",
  J46: "Aging and Independence",
  J47: "Community Development and Small Businesses",
  J50: "Cannabis Policy",
  J52: "Emergency Preparedness and Management",

  // ── Senate Committees ──────────────────────────────────────────────────────
  S29: "Rules",
  S30: "Ways and Means",
  S31: "Bills in the Third Reading",
  S48: "Post Audit and Oversight",
  S50: "Steering and Policy",
  S51: "Climate Change and Global Warming",
  S53: "Personnel and Administration",
  S55: "Intergovernmental Affairs",
  S56: "Ethics",
  S65: "the Census",
  S66: "Juvenile and Emerging Adult Justice",

  // ── House Committees ───────────────────────────────────────────────────────
  H33: "Rules",
  H34: "Ways and Means",
  H36: "Bills in the Third Reading",
  H38: "Ethics",
  H45: "Human Resources and Employee Engagement",
  H46: "Post Audit and Oversight",
  H51: "Climate Action and Sustainability",
  H52: "Steering, Policy and Scheduling",
  H53: "Operations, Facilities and Security",
  H54: "Federal Funding, Policy and Accountability",
  Hxx: "Intergovernmental Affairs",
};

/**
 * Returns the full display name for a committee ID, with the correct chamber prefix.
 * Falls back to the raw ID if unknown.
 */
export function getCommitteeName(id: string | null | undefined): string {
  if (!id) return "Unknown Committee";
  const name = COMMITTEE_NAMES[id];
  if (!name) return id;
  if (id.startsWith("S")) return `Senate Committee on ${name}`;
  if (id.startsWith("H")) return `House Committee on ${name}`;
  return `Joint Committee on ${name}`;
}

/**
 * Short form: just the name without the chamber prefix.
 */
export function getCommitteeShortName(id: string | null | undefined): string {
  if (!id) return "Unknown Committee";
  return COMMITTEE_NAMES[id] ?? id;
}
