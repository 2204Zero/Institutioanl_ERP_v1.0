# Institutional ERP Suite — Phase 6 Enterprise Finance & Operations System Architecture

## 1. Executive Summary & Enterprise Vision
The Phase 6 Finance & Accounting System transforms the Institutional ERP into a production-grade higher education financial platform comparable to **Oracle PeopleSoft Campus Financials, SAP S/4HANA Campus Finance, Ellucian Banner Finance, and Workday Student Financials**.

It unifies fee structure definitions, dynamic invoicing, online payment gateways (Razorpay, Stripe, PayPal, UPI), government/merit scholarship management, double-entry general ledger accounting, parent payment portal, and BI executive analytics.

---

## 2. High-Level Subsystem Topology

```
                   ┌─────────────────────────────────────────┐
                   │       Parent & Student Gateways         │
                   │  (Razorpay / Stripe / UPI NetBanking)   │
                   └────────────────────┬────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      Phase 6 Finance Service Layer                           │
│                      (src/services/financeService.ts)                        │
└──────┬──────────────────────┬──────────────────────┬──────────────────┬──────┘
       │                      │                      │                  │
       ▼                      ▼                      ▼                  ▼
┌──────────────┐      ┌──────────────┐      ┌────────────────┐  ┌──────────────┐
│  Fee Engine  │      │  Student     │      │ Scholarship &  │  │  Accounting  │
│  & Config    │      │  Invoicing   │      │ Financial Aid  │  │  Ledger (GL) │
└──────────────┘      └──────────────┘      └────────────────┘  └──────────────┘
```

---

## 3. Core Architectural Principles
1. **Double-Entry Bookkeeping**: Every transaction debit is matched with an equal credit in the General Ledger (`ChartOfAccounts`).
2. **Audit & Log Integrity**: Real-time terminal logging dispatches formatted event logs to stdout for log aggregators (ELK / CloudWatch).
3. **Role-Based Financial Control**: Sensitive operations (fee structure freezing, refund approval, journal posting) require `SuperAdmin`, `CFO`, or `Dean` authorization.
4. **GST & Tax Compliance**: Supports itemized GST rates (0%, 5%, 12%, 18%) and exports 80G/10E tax certificates.
