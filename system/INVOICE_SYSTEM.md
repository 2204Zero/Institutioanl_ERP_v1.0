# Institutional ERP Suite — Student Invoicing & Billing Subsystem

## 1. Executive Summary & Capabilities
The Invoicing Subsystem (`src/types/financeTypes.ts`, `src/services/financeService.ts`) automates invoice creation, payment status tracking, PDF printing, and receipt generation.

---

## 2. Invoice Data Structure & Line Items

- **Invoice Numbering Format**: `INV-YYYY-XXXX` (e.g., `INV-2026-1042`).
- **Line Items Breakdown**: Itemizes tuition, lab charges, library, and GST components.
- **Dynamic Statuses**: `PENDING`, `PARTIAL`, `PAID`, `OVERDUE`, `CANCELLED`, `REFUNDED`.

---

## 3. Receipt Generation & Tax Certificate Export
- **Payment Receipt (`ReceiptModal.tsx`)**: Issued instantly upon transaction completion. Includes transaction ID, gateway reference, itemized breakdown, and institutional digital signature.
- **Tax Certificates**: Generates section 80G and tuition fee certificates for parental income tax filing.
