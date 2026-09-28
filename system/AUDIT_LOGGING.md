# Institutional ERP Suite — Financial Audit & Event Stream Architecture

## 1. Terminal stdout Logging Standards
Every financial transaction invokes `logFinanceAction()`, outputting formatted logs to terminal stdout in the required Spring Boot format:

```
[FINANCE]
User: Aarav Sharma
Role: Parent
Action: Fee Payment
Invoice: INV-2026-1042
Amount: ₹45,000
Gateway: Razorpay
Status: SUCCESS
Duration: 52ms
```

---

## 2. Ingestion & Log Aggregators
- **Elasticsearch / Fluentd / Kibana (EFK)**: Ingests stdout JSON lines for searchability.
- **Immutability Guarantee**: Logs are append-only to ensure non-repudiation during statutory audits.
