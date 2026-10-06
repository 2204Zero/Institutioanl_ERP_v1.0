package com.example.demo.security.breaking;

import com.example.demo.audit.AuditAspect;
import com.example.demo.audit.Auditable;
import com.example.demo.audit.AuditLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuditInterceptionBreakingTest {

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuditAspect auditAspect;

    @Mock
    private ProceedingJoinPoint joinPoint;

    @Mock
    private MethodSignature methodSignature;

    @Mock
    private Auditable auditable;

    @Test
    public void testExceptionThrowingExecution() throws Throwable {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();

        lenient().when(auditable.action()).thenReturn("TEST_ACTION");
        lenient().when(auditable.resource()).thenReturn("TEST_RESOURCE");
        lenient().when(auditable.resourceIdParam()).thenReturn("");

        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getParameterNames()).thenReturn(new String[]{});
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{});
        
        when(joinPoint.proceed()).thenThrow(new RuntimeException("Simulated malicious crash"));

        assertThrows(RuntimeException.class, () -> {
            auditAspect.auditMethodExecution(joinPoint, auditable);
        });

        verify(auditLogService, times(1)).logAudit(argThat(entry -> 
            entry.result().contains("FAILURE") && 
            entry.actor().equals("ANONYMOUS")
        ));
    }
}
