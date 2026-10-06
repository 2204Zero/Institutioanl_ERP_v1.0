package com.example.demo.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;

@Aspect
@Component
public class AuditAspect {

    private final AuditLogService auditLogService;

    public AuditAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Lakshya
    // MODULE: #7 Audit Infrastructure
    // PENDING: Frontend JWT Bearer token generation and passing in requests
    // ACTION REQUIRED ONCE READY: Verify that SecurityContextHolder correctly contains 
    // the principal's username. Currently defaults to ANONYMOUS if missing.
    // ============================================================================

    @Around("@annotation(auditable)")
    public Object auditMethodExecution(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String actor = "ANONYMOUS";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            actor = authentication.getName();
        }

        String requestContext = "UNKNOWN";
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            requestContext = request.getRemoteAddr() + " - " + request.getHeader("User-Agent");
        }

        String resourceId = resolveResourceId(joinPoint, auditable.resourceIdParam());
        String result = "SUCCESS";

        try {
            Object returnValue = joinPoint.proceed();
            return returnValue;
        } catch (Throwable ex) {
            result = "FAILURE: " + ex.getMessage();
            throw ex;
        } finally {
            AuditEntry entry = new AuditEntry(
                    actor,
                    auditable.action(),
                    auditable.resource(),
                    resourceId,
                    Instant.now(),
                    result,
                    requestContext
            );
            auditLogService.logAudit(entry);
        }
    }

    private String resolveResourceId(ProceedingJoinPoint joinPoint, String paramName) {
        if (paramName == null || paramName.isEmpty()) {
            return "N/A";
        }
        
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameterNames.length; i++) {
            if (parameterNames[i].equals(paramName) && args[i] != null) {
                return args[i].toString();
            }
        }
        
        return "UNKNOWN";
    }
}
