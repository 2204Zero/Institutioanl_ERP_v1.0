# Institutional ERP Suite — Phase 6 Finance & Accounting REST API Reference

## 1. Overview
- **Base URL**: `https://api.erp.institution.edu/api/v1/finance`
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Endpoints Catalog

### `GET /api/v1/finance/kpis`
Returns top-level financial KPI metrics.
```json
{
  "todayCollection": 185000,
  "monthlyCollection": 9830000,
  "annualRevenue": 78500000,
  "outstandingFees": 12450000,
  "pendingRefundsCount": 3,
  "collectionRatePercentage": 88.4
}
```

### `GET /api/v1/finance/invoices`
Fetch invoices with optional filtering by roll number or status.

### `POST /api/v1/finance/payments/checkout`
Initiate online gateway payment session (Razorpay/Stripe).
```json
{
  "invoiceNumber": "INV-2026-1042",
  "amount": 34250,
  "method": "RAZORPAY"
}
```

### `POST /api/v1/finance/webhooks/razorpay`
Gateway webhook receiver endpoint for verifying payment signatures.

### `GET /api/v1/finance/accounting/trial-balance`
Fetch debit/credit trial balance statement.
