# Institutional ERP Suite — 7th Pay Commission Payroll Engine

## 1. Salary Component Formulas

$$\text{Gross Salary} = \text{Basic Pay} + \text{HRA} + \text{DA} + \text{Transport Allowance} + \text{Special Allowance}$$

Where:
- $\text{HRA} = 24\% \text{ of Basic Pay}$ (Tier 1 city rate)
- $\text{DA} = 50\% \text{ of Basic Pay}$ (Dearness Allowance standard)

$$\text{Total Deductions} = \text{PF (12\% of Basic)} + \text{Professional Tax} + \text{Income Tax (TDS)}$$

$$\text{Net Payable Salary} = \text{Gross Salary} - \text{Total Deductions}$$

---

## 2. Direct Bank Batch Processing & Accounting Integration
When monthly payroll runs:
1. Bank transfer CSV/NEFT file is generated (`PAY-YYYY-MM-XXXX`).
2. General Ledger entry is posted in Finance module (`acc-8 Faculty Salary Expense`).
3. Payslip PDF link is delivered to Employee Self Service (ESS) portal.
