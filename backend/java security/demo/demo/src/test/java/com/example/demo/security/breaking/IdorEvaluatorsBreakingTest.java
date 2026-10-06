package com.example.demo.security.breaking;

import com.example.demo.security.evaluators.AdmissionsSecurityEvaluator;
import com.example.demo.security.evaluators.RegistrationSecurityEvaluator;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertThrows;

public class IdorEvaluatorsBreakingTest {

    private AdmissionsSecurityEvaluator admissionsSecurityEvaluator = new AdmissionsSecurityEvaluator();
    private RegistrationSecurityEvaluator registrationSecurityEvaluator = new RegistrationSecurityEvaluator();

    @Test
    public void testRegistrationHorizontalPrivilegeEscalation() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("studentA", "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        assertThrows(AccessDeniedException.class, () -> {
            registrationSecurityEvaluator.canModifyRegistration("studentB");
        });
    }

    @Test
    public void testAdmissionsVerticalPrivilegeEscalation() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("normalUser", "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        assertThrows(AccessDeniedException.class, () -> {
            admissionsSecurityEvaluator.canReviewApplication("app123");
        });
    }
    
    @Test
    public void testNullAndMalformedTargetIds() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("studentA", "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")))
        );

        assertThrows(AccessDeniedException.class, () -> {
            registrationSecurityEvaluator.canModifyRegistration(null);
        });

        assertThrows(AccessDeniedException.class, () -> {
            registrationSecurityEvaluator.canModifyRegistration("-1");
        });
    }
}
