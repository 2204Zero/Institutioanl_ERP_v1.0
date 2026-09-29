# Institutional ERP Suite — Payment Gateway Architecture & Webhook Integration

## 1. Gateway Support Matrix
The ERP platform integrates with production payment gateways:
- **Razorpay**: Domestic UPI, NetBanking, Debit/Credit Card, Wallet.
- **Stripe**: International Credit Cards, Apple Pay, Google Pay.
- **PayPal**: Cross-border international student tuition payments.
- **Direct UPI & QR Code**: Expiring dynamic QR codes for instant bank app scanning.

---

## 2. Payment Lifecycle & Webhook Verification Sequence

```
[ Parent/Student Initiates Payment ]
                  │
                  ▼
[ Gateway Checkout Modal Rendered (Razorpay/Stripe) ]
                  │
                  ▼
[ User Authorizes Payment ] ──> [ Payment Gateway Server Processing ]
                                                │
                                                ▼
[ Webhook Event Dispatched to ERP: payment.captured ]
                                                │
                                                ▼
[ HMAC-SHA256 Signature Verification on ERP Backend ]
                                                │
                                                ▼
[ Invoice Status updated to PAID / PARTIAL & Ledger Posted ]
```

---

## 3. Webhook Signature Verification Code Spec

```typescript
import crypto from 'crypto';

export function verifyRazorpayWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}
```

---

## 4. Refund & Reconciliation Workflows
- Automated daily settlement reconciliation script verifies gateway payouts against internal bank ledger (`acc-3 HDFC Collection`).
- Refund requests require dual signature authorization before triggering gateway refund API (`/v1/payments/{id}/refund`).
