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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DevelopmentFixtureSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DevelopmentFixtureSeeder seeder;

    @BeforeEach
    void setUp() {
        lenient().when(passwordEncoder.encode(anyString())).thenAnswer(inv -> "encoded_" + inv.getArgument(0));
        seeder = new DevelopmentFixtureSeeder(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Seeds all default test users when user table is initially empty or only has superadmin")
    void seedTestUsers_seedsMissingUsersEvenIfSuperadminExists() {
        // Superadmin exists, but standard test accounts do not
        when(userRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        seeder.seedTestUsers();

        // 6 regular users + 1 disabled_user = 7 users saved
        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository, times(7)).save(userCaptor.capture());

        List<AppUser> savedUsers = userCaptor.getAllValues();
        List<String> usernames = savedUsers.stream().map(AppUser::getUsername).toList();
        assertThat(usernames).containsExactlyInAnyOrder(
                "admin", "faculty", "student", "parent", "finance", "user", "disabled_user"
        );
    }

    @Test
    @DisplayName("Is idempotent and does not overwrite or duplicate existing users")
    void seedTestUsers_isIdempotent_whenUsersAlreadyExist() {
        // All test users already exist
        when(userRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(true);

        seeder.seedTestUsers();

        // No new saves should occur, protecting existing accounts and roles
        verify(userRepository, never()).save(any(AppUser.class));
    }

    @Test
    @DisplayName("Selectively seeds only missing users when some already exist")
    void seedTestUsers_selectivelySeedsOnlyMissingUsers() {
        // 'admin' already exists, others do not
        when(userRepository.existsByUsernameIgnoreCase("admin")).thenReturn(true);
        when(userRepository.existsByUsernameIgnoreCase("faculty")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("student")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("parent")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("finance")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("user")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("disabled_user")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        seeder.seedTestUsers();

        // 6 users saved (excluding admin)
        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository, times(6)).save(userCaptor.capture());

        List<String> usernames = userCaptor.getAllValues().stream().map(AppUser::getUsername).toList();
        assertThat(usernames).doesNotContain("admin");
        assertThat(usernames).contains("faculty", "student", "parent", "finance", "user", "disabled_user");
    }
}
