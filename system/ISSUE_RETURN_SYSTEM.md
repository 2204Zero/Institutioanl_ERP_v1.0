# Enterprise Circulation Desk — Issue, Return, & Renew System

## 1. Loan Rules & Renewal Limits
- **Max Loan Period**: 14 Days for Students, 30 Days for Faculty.
- **Max Books Allowed**: 4 Books for Students, 10 Books for Faculty.
- **Renewal Limits**: Up to 2 renewals if no pending reservation queue exists.

---

## 2. Reservation Queue Algorithm
When a book has `copiesAvailable: 0`, a member can place a reservation request. The queue is served in First-In-First-Out (FIFO) order upon book check-in.
