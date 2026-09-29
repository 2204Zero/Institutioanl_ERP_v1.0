# Institutional ERP Suite — PostgreSQL Campus Operations Relational Database Schema

## 1. DDL Schemas

```sql
-- 1. Library Books Table
CREATE TABLE books (
    id VARCHAR(36) PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    copies_total INT NOT NULL DEFAULT 1,
    copies_available INT NOT NULL DEFAULT 1,
    shelf_location VARCHAR(30) NOT NULL,
    is_digital BOOLEAN DEFAULT FALSE,
    download_url TEXT
);

-- 2. Hostel Rooms Table
CREATE TABLE hostel_rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    block_code VARCHAR(20) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    monthly_fee NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('AVAILABLE', 'FULL', 'UNDER_MAINTENANCE'))
);

-- 3. Maintenance Tickets Table
CREATE TABLE maintenance_tickets (
    id VARCHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(30) NOT NULL UNIQUE,
    category VARCHAR(30) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reported_by VARCHAR(100) NOT NULL,
    reported_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);
```
