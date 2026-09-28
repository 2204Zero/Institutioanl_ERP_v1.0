# PostgreSQL Transport Relational Database Schema DDL

```sql
CREATE TABLE buses (
    id VARCHAR(36) PRIMARY KEY,
    bus_number VARCHAR(30) NOT NULL UNIQUE,
    bus_code VARCHAR(20) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 50,
    model VARCHAR(100) NOT NULL,
    gps_device_id VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'))
);

CREATE TABLE routes (
    id VARCHAR(36) PRIMARY KEY,
    route_code VARCHAR(30) NOT NULL UNIQUE,
    route_name VARCHAR(150) NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL
);
```
