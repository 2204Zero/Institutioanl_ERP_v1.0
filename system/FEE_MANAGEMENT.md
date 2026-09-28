# Institutional ERP Suite — Fee Structure Engine & Configuration Rules

## 1. Overview & Operational Mandate
The Fee Management System (`src/types/financeTypes.ts`, `src/services/financeService.ts`) enables multi-category fee structures configurable by degree program, department, academic session, and student category.

---

## 2. Fee Categories Supported

- **Tuition Fee**: Core academic instruction charges.
- **Admission & Registration Fee**: One-time enrollment processing fees.
- **Library & Digital Subscriptions**: IEEE, ACM, and Physical Library access.
- **Hostel & Mess Fee**: Room allocation and catering deposits.
- **Transport & Bus Passes**: Route-based commuting fees.
- **Laboratory & Computing Fee**: High-performance AI GPU & VLSI lab fees.
- **Sports & Development Fee**: Campus sports facilities & infra development.
- **Late Penalty Fines**: Daily automated accrued penalty (e.g. ₹100/day past due date).
- **Custom Fees**: Miscellaneous exam re-issue, transcript, or convocation charges.

---

## 3. Calculation & Tax Rules

$$\text{Subtotal} = \sum_{i=1}^{k} \text{FeeItem}_i.\text{amount}$$

$$\text{GST Amount} = \sum_{i=1}^{k} \left( \text{FeeItem}_i.\text{amount} \times \frac{\text{FeeItem}_i.\text{gstPercentage}}{100} \right)$$

$$\text{Net Payable} = \text{Subtotal} + \text{GST Amount} - \text{Scholarship Discount} + \text{Late Penalty}$$

---

## 4. Installment & Freeze Protocols
- **Installment Plans**: Allows splitting total semester fees into 2 or 3 scheduled installments.
- **Fee Freeze**: Once a fee structure status is set to `isFrozen: true`, historic fee entries cannot be modified; any adjustments require generating a new `revisionVersion`.
