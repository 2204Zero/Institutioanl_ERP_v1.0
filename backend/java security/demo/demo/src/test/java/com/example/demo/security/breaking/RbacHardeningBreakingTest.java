package com.example.demo.security.breaking;

import com.example.demo.auth.service.CustomUserDetailsService;
import com.example.demo.role.service.RoleAssignmentService;
import com.example.demo.security.evaluators.AdmissionsSecurityEvaluator;
import com.example.demo.security.evaluators.RegistrationSecurityEvaluator;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

public class RbacHardeningBreakingTest {

    private CustomUserDetailsService userDetailsService;
    private RoleAssignmentService roleAssignmentService;
    private UserRepository userRepository;
    private RegistrationSecurityEvaluator registrationSecurityEvaluator;
    private AdmissionsSecurityEvaluator admissionsSecurityEvaluator;

    @BeforeEach
    public void setup() {
        userRepository = Mockito.mock(UserRepository.class);
        userDetailsService = new CustomUserDetailsService(userRepository);
        roleAssignmentService = new RoleAssignmentService(userRepository);
        registrationSecurityEvaluator = new RegistrationSecurityEvaluator();
        admissionsSecurityEvaluator = new AdmissionsSecurityEvaluator();
    }

    @Test
    public void testRoleToPermissionExpansion() {
        User user = new User();
        user.setUsername("testadmin");
        user.setPasswordHash("hash");
        user.setStatus("ACTIVE");
        user.setRoles(Set.of("ROLE_ADMIN"));

        when(userRepository.findByUsername("testadmin")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("testadmin");
        
        // Assert that the string role got expanded into granular permissions
        boolean hasUserCreate = details.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("USER_CREATE"));
        boolean hasRoleAdmin = details.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        assertTrue(hasUserCreate, "CustomUserDetailsService failed to expand ROLE_ADMIN to USER_CREATE");
        assertTrue(hasRoleAdmin, "CustomUserDetailsService stripped the base ROLE_ADMIN authority");
    }

    @Test
    public void testSelfAssignmentPrivilegeEscalationIsBlocked() {
        // Authenticate as normal user
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("hacker", "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        User hackerUser = new User();
        hackerUser.setUsername("hacker");

        when(userRepository.findById(1L)).thenReturn(Optional.of(hackerUser));

        assertThrows(AccessDeniedException.class, () -> {
            roleAssignmentService.assignRole(1L, "ROLE_ADMIN");
        }, "Self-assignment IDOR vulnerability remains!");
    }
    
    @Test
    public void testSuperAdminAssignmentByNonSuperAdminBlocked() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin1", "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
        );

        User targetUser = new User();
        targetUser.setUsername("target");

        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));

        assertThrows(AccessDeniedException.class, () -> {
            roleAssignmentService.assignRole(2L, "ROLE_SUPER_ADMIN");
        }, "Only SUPER_ADMIN should be able to assign SUPER_ADMIN.");
    }

    @Test
    public void testDefensiveNullChecksInEvaluators() {
        assertThrows(AccessDeniedException.class, () -> {
            registrationSecurityEvaluator.canModifyRegistration(null);
        });
        assertThrows(AccessDeniedException.class, () -> {
            admissionsSecurityEvaluator.canReviewApplication("  ");
        });
    }
}
