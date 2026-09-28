# PostgreSQL Hostel Relational Database Schema DDL

```sql
CREATE TABLE hostels (
    id VARCHAR(36) PRIMARY KEY,
    block_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    total_floors INT NOT NULL,
    total_rooms INT NOT NULL,
    warden_name VARCHAR(100) NOT NULL,
    total_capacity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    block_code VARCHAR(30) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    monthly_fee NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('AVAILABLE', 'FULL', 'MAINTENANCE', 'RESERVED'))
);
```
