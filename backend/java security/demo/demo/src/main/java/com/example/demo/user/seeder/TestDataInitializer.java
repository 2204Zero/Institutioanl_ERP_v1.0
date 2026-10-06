package com.example.demo.user.seeder;

import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TestDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public TestDataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUser("super_admin_user", "superadmin@example.com", "password123", "ROLE_SUPER_ADMIN");
        seedUser("security_admin_user", "securityadmin@example.com", "password123", "ROLE_SECURITY_ADMIN");
        seedUser("admin_user", "admin@example.com", "password123", "ROLE_ADMIN");
        seedUser("finance_user", "finance@example.com", "password123", "ROLE_FINANCE");
        seedUser("faculty_user", "faculty@example.com", "password123", "ROLE_FACULTY");
        seedUser("student_user_1", "student1@example.com", "password123", "ROLE_STUDENT");
        seedUser("student_user_2", "student2@example.com", "password123", "ROLE_STUDENT");
        seedUser("parent_user", "parent@example.com", "password123", "ROLE_PARENT");
    }

    private void seedUser(String username, String email, String rawPassword, String role) {
        if (!userRepository.existsByUsername(username) && !userRepository.existsByEmail(email)) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
            user.setPasswordHash(encoder.encode(rawPassword));
            user.setStatus("ACTIVE");
            user.getRoles().add(role);
            userRepository.save(user);
        }
    }
}
