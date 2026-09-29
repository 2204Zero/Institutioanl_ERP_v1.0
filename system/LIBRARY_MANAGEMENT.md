# Institutional ERP Suite — Phase 8 Enterprise Library Management System

## 1. System Overview & Capabilities
The Library System (`src/types/campusTypes.ts`, `src/services/campusService.ts`, `src/pages/LibraryPage.tsx`) provides an integrated physical and digital repository system.

Features include:
- ISBN Cataloging & Barcode/QR Code scanning.
- Book Loans (Issue / Return / Renewal).
- Automated Overdue Fine Calculations (Synced to Finance Module).
- E-Books, Dissertations & Thesis Digital Repository.

---

## 2. Loan & Overdue Fine Engine

$$\text{Overdue Fine} = \text{Days Overdue} \times \text{Daily Fine Rate (₹10/day)}$$

Upon returning an overdue volume, fine details are automatically posted to the student's finance ledger via `FinanceService`.
