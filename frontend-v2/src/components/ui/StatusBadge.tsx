import { Badge } from "./badge"

// Shared backend domain statuses mapped to visual semantics
const STATUS_MAP: Record<string, "success" | "warning" | "destructive" | "info" | "default" | "secondary"> = {
  // ApplicationStatus
  DRAFT: "secondary",
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  DOCUMENT_VERIFICATION_PENDING: "warning",
  WAITLISTED: "warning",
  ADMITTED: "success",
  REJECTED: "destructive",
  ENROLLED: "success",

  // ConcessionStatus
  PENDING: "warning",
  APPROVED: "success",
  REVOKED: "destructive",

  // PaymentStatus
  SUCCESS: "success",
  FAILED: "destructive",
  CANCELLED: "destructive",
  REVERSED: "secondary",

  // StudentFeeStatus
  PARTIALLY_PAID: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  WAIVED: "info",

  // StudentStatus
  ACTIVE: "success",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
  GRADUATED: "info",
  ALUMNI: "info",
  DROPPED: "destructive",
  TRANSFERRED: "secondary",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toUpperCase() || "UNKNOWN";
  const variant = STATUS_MAP[normalizedStatus] || "default";

  return (
    <Badge variant={variant} className={className}>
      {normalizedStatus.replace(/_/g, ' ')}
    </Badge>
  );
}
