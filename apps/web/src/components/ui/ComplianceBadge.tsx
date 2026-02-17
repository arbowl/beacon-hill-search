import { cn } from "@/lib/utils";
import type { ComplianceState } from "@/lib/models/bill";

interface ComplianceBadgeProps {
  state: ComplianceState | null | undefined;
  className?: string;
}

const LABELS: Record<string, string> = {
  Compliant: "Compliant",
  "Non-Compliant": "Non-Compliant",
  Pending: "In Progress",
  Unknown: "In Progress",
  Exempt: "Exempt",
};

export function ComplianceBadge({ state, className }: ComplianceBadgeProps) {
  if (!state) return null;

  const cls =
    state === "Compliant"
      ? "badge-compliant"
      : state === "Non-Compliant"
      ? "badge-non-compliant"
      : "badge-in-progress";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        cls,
        className
      )}
    >
      {LABELS[state] ?? state}
    </span>
  );
}
