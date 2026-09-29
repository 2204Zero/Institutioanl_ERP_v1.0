# PostgreSQL Infrastructure & Asset Relational Schema DDL

```sql
CREATE TABLE campus_buildings (
    id VARCHAR(36) PRIMARY KEY,
    building_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    total_floors INT NOT NULL,
    total_area_sqft INT NOT NULL
);

CREATE TABLE enterprise_assets (
    id VARCHAR(36) PRIMARY KEY,
    asset_code VARCHAR(30) NOT NULL UNIQUE,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    purchase_cost NUMERIC(12,2) NOT NULL,
    current_depreciated_value NUMERIC(12,2) NOT NULL
);
```
