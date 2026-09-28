# Role-Based Access Control (RBAC) Specification

## 1. Role Authority Matrix

| Role | Domain Scope | Granular Spring Security Authorities |
| :--- | :--- | :--- |
| **SuperAdmin** | Institution Wide | `ROLE_SUPERADMIN`, `read:all`, `write:all`, `delete:all`, `manage:users` |
| **Admin** | Operations & Finance | `ROLE_ADMIN`, `read:finance`, `write:finance`, `approve:refund`, `read:students` |
| **Dean** | Academic Administration | `ROLE_DEAN`, `read:academics`, `write:academics`, `read:students`, `write:students` |
| **Teacher / Faculty** | Course & Evaluation | `ROLE_TEACHER`, `read:academics`, `write:marks`, `write:attendance` |
| **Student** | Student Portal | `ROLE_STUDENT`, `read:own_profile`, `read:own_transcript`, `read:own_dues` |
| **Parent** | Guardian View | `ROLE_PARENT`, `read:ward_progress`, `pay:ward_dues` |

## 2. Method Security Annotations
Spring Boot controllers enforce authorization using `@PreAuthorize`:
```java
@PreAuthorize("hasRole('ADMIN') or hasAuthority('approve:refund')")
@PostMapping("/finance/refunds/{id}/approve")
public ResponseEntity<APIResponse<Void>> approveRefund(@PathVariable String id) { ... }
```
