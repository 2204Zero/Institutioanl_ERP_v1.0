# Institutional ERP Suite — Payment Security & PCI-DSS Compliance

## 1. Security Compliance Framework
1. **PCI-DSS Level 1 Standards**: Card details are never stored on internal servers. Checkout relies strictly on gateway SDK elements (Razorpay Checkout / Stripe Elements).
2. **TLS 1.3 Transport Security**: All API traffic encrypted in transit.
3. **HMAC-SHA256 Webhook Signatures**: Prevents payload tampering and man-in-the-middle attacks.
4. **Idempotency Keys**: Prevents duplicate debit transactions during gateway timeouts.
