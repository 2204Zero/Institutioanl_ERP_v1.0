# Enterprise Library Management System Architecture (Phase 8)

## 1. Executive Summary & Topology
The Enterprise Library Management System transforms institutional library administration into a Koha/Alma-grade platform. It unifies ISBN cataloging, RFID/QR member access cards, circulation issue/return desks, e-book repositories, fine management synced to Finance, and faculty procurement.

---

## 2. Component Topology

```
                  ┌──────────────────────────────────────────────┐
                  │    Member Web Portal & Self-Service Kiosks   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                      Phase 8 Library Service Layer Engine                      │
│                      (src/services/libraryService.ts)                          │
└──────┬───────────────────┬─────────────────┬───────────────────┬───────────────┘
       │                   │                 │                   │
       ▼                   ▼                 ▼                   ▼
┌──────────────┐   ┌───────────────┐  ┌──────────────┐    ┌──────────────┐
│ ISBN Catalog │   │ Circulation   │  │ E-Resources   │    │ Fine Sync    │
│ & Search     │   │ Desk & Loans  │  │ & E-Books    │    │ to Finance   │
└──────────────┘   └───────────────┘  └──────────────┘    └──────────────┘
```

---

## 3. Core Enterprise Standards
1. **Double Fine Sync**: Overdue fines generated in the library automatically sync to the ERP Finance ledger (`FinanceService`).
2. **Terminal Audit Logging**: Every operation outputs formatted logs to stdout in the exact required format:
   ```
   [LIBRARY]
   User : Aarav Sharma
   Role : Librarian
   Action : Issue Book
   Book : Clean Code
   Student : 2024CS101
   Status : SUCCESS
   Duration : 45ms
   ```
