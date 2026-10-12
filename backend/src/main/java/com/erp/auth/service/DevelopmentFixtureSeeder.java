package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile({"dev", "test"})
public class DevelopmentFixtureSeeder {

    private static final Logger log = LoggerFactory.getLogger(DevelopmentFixtureSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevelopmentFixtureSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedTestUsers() {
        seedUser("admin", "Admin@123", "admin@erp.com", Role.ADMIN);
        seedUser("faculty", "Faculty@123", "faculty@erp.com", Role.FACULTY);
        seedUser("student", "Student@123", "student@erp.com", Role.STUDENT);
        seedUser("parent", "Parent@123", "parent@erp.com", Role.PARENT);
        seedUser("finance", "Finance@123", "finance@erp.com", Role.FINANCE);
        seedUser("user", "password", "user@erp.com", Role.STUDENT); // generic user
        
        if (!userRepository.existsByUsernameIgnoreCase("disabled_user")) {
            AppUser disabledUser = new AppUser("disabled_user", passwordEncoder.encode("Password@123"), "disabled@erp.com", Role.STUDENT, false);
            userRepository.save(disabledUser);
        }

        log.info("Development/Test user fixtures seeded successfully.");
    }

    private void seedUser(String username, String rawPassword, String email, Role role) {
        if (!userRepository.existsByUsernameIgnoreCase(username) && !userRepository.existsByEmailIgnoreCase(email)) {
            AppUser user = new AppUser(
                    username,
                    passwordEncoder.encode(rawPassword),
                    email,
                    role,
                    true
            );
            userRepository.save(user);
        }
    }
}
