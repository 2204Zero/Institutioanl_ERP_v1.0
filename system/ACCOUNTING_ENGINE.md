# Institutional ERP Suite — Accounting Subsystem & General Ledger

## 1. Overview & Double-Entry Accounting Standard
The Accounting Subsystem (`src/services/financeService.ts`) follows GAAP (Generally Accepted Accounting Principles) double-entry bookkeeping rules.

Every transaction requires equal debit and credit journal entries:
$$\sum \text{Debit} = \sum \text{Credit}$$

---

## 2. Chart of Accounts Topology

```
1000 - ASSETS
  ├── 1010-CASH (Main Cash Ledger)
  ├── 1020-SBI-OPERATING (SBI Main Operating Account)
  └── 1030-HDFC-COLLECTION (HDFC Fee Gateway Account)

2000 - LIABILITIES
  └── 2010-FEE-ADVANCE (Student Advance Dues)

3000 - EQUITY
  └── 3010-CAPITAL-FUND (Institutional Endowment Fund)

4000 - REVENUE
  ├── 4010-TUITION-REVENUE (Academic Tuition Income)
  └── 4020-LAB-REVENUE (Lab & Facilities Income)

5000 - EXPENSES
  ├── 5010-FACULTY-SALARY (Faculty & Staff Payroll)
  └── 5020-INFRA-MAINTENANCE (Campus Infrastructure Operations)
```

---

## 3. Financial Statements Generated
1. **Trial Balance**: Summarizes debit and credit balances for all accounts to verify arithmetic accuracy.
2. **Income & Expense Statement (P&L)**: Computes Net Surplus/Deficit:
   $$\text{Net Surplus} = \text{Total Revenues} - \text{Total Expenses}$$
3. **Balance Sheet**: Evaluates fundamental accounting identity:
   $$\text{Assets} = \text{Liabilities} + \text{Equity}$$
