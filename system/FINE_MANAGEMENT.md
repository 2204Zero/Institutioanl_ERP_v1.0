# Library Fine Engine & Direct ERP Finance Integration

## 1. Automated Fine Formulation

$$\text{Late Fine} = \text{Days Overdue} \times ₹10/\text{day}$$

$$\text{Lost Book Fine} = \text{Book Replacement Price} + ₹200 \text{ Administrative Fee}$$

---

## 2. Direct ERP Finance Ledger Sync
When a fine is assessed or paid, a ledger transaction is posted directly to the Finance Module (`FinanceService.processPayment`), generating an official receipt (`RCP-YYYY-XXXX`).
