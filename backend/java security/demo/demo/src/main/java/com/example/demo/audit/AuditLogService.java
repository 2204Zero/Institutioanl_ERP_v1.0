package com.example.demo.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Singhal
    // MODULE: #7 Audit Infrastructure
    // PENDING: PostgreSQL 'audit_logs' table, Liquibase/Flyway migration, JPA Repository
    // ACTION REQUIRED ONCE READY: Inject AuditLogRepository here and persist the 
    // AuditEntry object to the database instead of just logging to Slf4j.
    // ============================================================================

    public void logAudit(AuditEntry auditEntry) {
        log.info("AUDIT LOG -> Actor: {} | Action: {} | Resource: {} | ResourceID: {} | Result: {} | Context: {} | Time: {}",
                auditEntry.actor(),
                auditEntry.action(),
                auditEntry.resource(),
                auditEntry.resourceId(),
                auditEntry.result(),
                auditEntry.requestContext(),
                auditEntry.timestamp());
    }
}
