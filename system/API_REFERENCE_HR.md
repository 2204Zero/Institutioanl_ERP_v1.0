# Institutional ERP Suite — Phase 7 HRMS & Payroll REST API Reference

## 1. Endpoint Catalog

### `GET /api/v1/hr/employees`
Fetch list of employees with optional department/category filters.

### `POST /api/v1/hr/employees`
Register a new faculty or staff member and initialize credentials.

### `POST /api/v1/hr/payroll/process`
Trigger monthly batch payroll processing.

### `GET /api/v1/hr/payslips/{employeeId}`
Fetch payslips for Employee Self Service (ESS) view.

### `POST /api/v1/hr/leaves/apply`
Submit leave application.
