package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BootstrapServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        lenient().when(passwordEncoder.encode(anyString())).thenAnswer(inv -> "encoded_" + inv.getArgument(0));
    }

    @Test
    @DisplayName("1. Disabled bootstrap skips without inspecting or saving users")
    void shouldSkipBootstrapWhenDisabled() {
        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, false, "admin", "admin@edupulse.com", "Secret123!"
        );

        service.runBootstrap();

        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("2. Missing username throws IllegalStateException")
    void shouldFailFastWhenUsernameIsBlank() {
        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "", "admin@edupulse.com", "Secret123!"
        );

        assertThatThrownBy(service::runBootstrap)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Missing required bootstrap environment variables.");

        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("3. Missing email throws IllegalStateException")
    void shouldFailFastWhenEmailIsBlank() {
        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "   ", "Secret123!"
        );

        assertThatThrownBy(service::runBootstrap)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Missing required bootstrap environment variables.");

        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("4. Missing password throws IllegalStateException")
    void shouldFailFastWhenPasswordIsBlank() {
        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "admin@edupulse.com", null
        );

        assertThatThrownBy(service::runBootstrap)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Missing required bootstrap environment variables.");

        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("5. Existing SUPER_ADMIN skips bootstrap idempotently")
    void shouldSkipBootstrapWhenSuperAdminAlreadyExists() {
        AppUser existingSuperAdmin = new AppUser("existing_admin", "hash", "existing@edupulse.com", Role.SUPER_ADMIN, true);
        when(userRepository.findAll()).thenReturn(List.of(existingSuperAdmin));

        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "admin@edupulse.com", "Secret123!"
        );

        service.runBootstrap();

        verify(userRepository, never()).saveAndFlush(any(AppUser.class));
    }

    @Test
    @DisplayName("6. Existing username for another role throws IllegalStateException (prevents account hijacking)")
    void shouldFailWhenUsernameAlreadyExistsForAnotherRole() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.existsByUsernameIgnoreCase("superadmin")).thenReturn(true);

        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "admin@edupulse.com", "Secret123!"
        );

        assertThatThrownBy(service::runBootstrap)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Bootstrap conflict: Username or email already in use.");

        verify(userRepository, never()).saveAndFlush(any(AppUser.class));
    }

    @Test
    @DisplayName("7. Existing email for another role throws IllegalStateException (prevents collision)")
    void shouldFailWhenEmailAlreadyExistsForAnotherRole() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.existsByUsernameIgnoreCase("superadmin")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("admin@edupulse.com")).thenReturn(true);

        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "admin@edupulse.com", "Secret123!"
        );

        assertThatThrownBy(service::runBootstrap)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Bootstrap conflict: Username or email already in use.");

        verify(userRepository, never()).saveAndFlush(any(AppUser.class));
    }

    @Test
    @DisplayName("8. Successful bootstrap provisions superadmin with encoded password")
    void shouldProvisionSuperAdminSuccessfully() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.existsByUsernameIgnoreCase("superadmin")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("admin@edupulse.com")).thenReturn(false);

        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "admin@edupulse.com", "Secret123!"
        );

        service.runBootstrap();

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());

        AppUser savedUser = userCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo("superadmin");
        assertThat(savedUser.getPassword()).isEqualTo("encoded_Secret123!");
        assertThat(savedUser.getEmail()).isEqualTo("admin@edupulse.com");
        assertThat(savedUser.getRole()).isEqualTo(Role.SUPER_ADMIN);
        assertThat(savedUser.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("9. Concurrent race condition: gracefully handles DataIntegrityViolationException if another node created SUPER_ADMIN")
    void shouldHandleConcurrentRaceConditionGracefully() {
        when(userRepository.findAll())
                .thenReturn(Collections.emptyList()) // First check: no superadmin
                .thenReturn(List.of(new AppUser("superadmin", "hash", "admin@edupulse.com", Role.SUPER_ADMIN, true))); // Second check in catch block

        when(userRepository.existsByUsernameIgnoreCase("superadmin")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("admin@edupulse.com")).thenReturn(false);
        doThrow(new DataIntegrityViolationException("duplicate key value violates unique constraint users_username_key"))
                .when(userRepository).saveAndFlush(any(AppUser.class));

        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "admin@edupulse.com", "Secret123!"
        );

        // Should complete cleanly without throwing
        service.runBootstrap();

        verify(userRepository).saveAndFlush(any(AppUser.class));
    }

    @Test
    @DisplayName("10. Rethrows DataIntegrityViolationException if race check finds no SUPER_ADMIN")
    void shouldRethrowDataIntegrityViolationWhenNoSuperAdminExists() {
        when(userRepository.findAll())
                .thenReturn(Collections.emptyList()) // First check: no superadmin
                .thenReturn(Collections.emptyList()); // Second check in catch block: still no superadmin

        when(userRepository.existsByUsernameIgnoreCase("superadmin")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("admin@edupulse.com")).thenReturn(false);
        doThrow(new DataIntegrityViolationException("some unexpected database constraint"))
                .when(userRepository).saveAndFlush(any(AppUser.class));

        BootstrapService service = new BootstrapService(
                userRepository, passwordEncoder, true, "superadmin", "admin@edupulse.com", "Secret123!"
        );

        assertThatThrownBy(service::runBootstrap)
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("some unexpected database constraint");
    }
}
