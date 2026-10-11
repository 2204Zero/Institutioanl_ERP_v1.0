package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BootstrapService {

    private static final Logger log = LoggerFactory.getLogger(BootstrapService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${bootstrap.superadmin.enabled:false}")
    private boolean bootstrapEnabled;

    @Value("${bootstrap.superadmin.username:}")
    private String bootstrapUsername;

    @Value("${bootstrap.superadmin.email:}")
    private String bootstrapEmail;

    @Value("${bootstrap.superadmin.password:}")
    private String bootstrapPassword;

    public BootstrapService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void runBootstrap() {
        if (!bootstrapEnabled) {
            log.info("Super admin bootstrap is disabled. Normal application startup.");
            return;
        }

        if (bootstrapUsername == null || bootstrapUsername.isBlank() ||
            bootstrapEmail == null || bootstrapEmail.isBlank() ||
            bootstrapPassword == null || bootstrapPassword.isBlank()) {
            log.error("Bootstrap is enabled but required variables (username, email, password) are missing. Failing startup.");
            throw new IllegalStateException("Missing required bootstrap environment variables.");
        }

        boolean hasSuperAdmin = userRepository.findAll().stream()
                .anyMatch(user -> user.getRole() == Role.SUPER_ADMIN);

        if (hasSuperAdmin) {
            log.info("A SUPER_ADMIN already exists in the database. Bootstrap skipped.");
            return;
        }

        if (userRepository.existsByUsernameIgnoreCase(bootstrapUsername) ||
            userRepository.existsByEmailIgnoreCase(bootstrapEmail)) {
            log.error("Bootstrap failed: username or email already exists for another role.");
            throw new IllegalStateException("Bootstrap conflict: Username or email already in use.");
        }

        AppUser superAdmin = new AppUser(
                bootstrapUsername,
                passwordEncoder.encode(bootstrapPassword),
                bootstrapEmail,
                Role.SUPER_ADMIN,
                true
        );

        userRepository.save(superAdmin);
        log.info("Successfully provisioned initial SUPER_ADMIN account: {}. Please disable bootstrap configuration in production.", bootstrapUsername);
    }
}
