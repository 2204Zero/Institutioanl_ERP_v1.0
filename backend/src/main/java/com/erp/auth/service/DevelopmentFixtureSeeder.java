package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile({"dev", "test", "dev-json"})
public class DevelopmentFixtureSeeder {

    private static final Logger log = LoggerFactory.getLogger(DevelopmentFixtureSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.erp.student.repository.StudentRepository studentRepository;
    private final com.erp.guardian.repository.GuardianRepository guardianRepository;

    @org.springframework.beans.factory.annotation.Value("${erp.devjson.seed-fixtures:true}")
    private boolean seedFixturesEnabled;

    public DevelopmentFixtureSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this(userRepository, passwordEncoder, null, null);
    }

    @Autowired
    public DevelopmentFixtureSeeder(UserRepository userRepository,
                                    PasswordEncoder passwordEncoder,
                                    @Autowired(required = false) com.erp.student.repository.StudentRepository studentRepository,
                                    @Autowired(required = false) com.erp.guardian.repository.GuardianRepository guardianRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentRepository = studentRepository;
        this.guardianRepository = guardianRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedTestUsers() {
        if (!seedFixturesEnabled) {
            log.info("Development user fixture seeding is disabled (erp.devjson.seed-fixtures=false).");
            return;
        }
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

        // Link student 1 with demo student user and parent guardian
        if (studentRepository != null && guardianRepository != null) {
            studentRepository.findById(1L).ifPresent(s1 -> {
                if (s1.getUserId() == null) {
                    userRepository.findByUsernameIgnoreCase("student").ifPresent(stu -> {
                        s1.setUserId(stu.getId());
                        studentRepository.save(s1);
                    });
                }
                userRepository.findByUsernameIgnoreCase("parent").ifPresent(parentUser -> {
                    java.util.List<com.erp.guardian.entity.Guardian> existingGuardians = guardianRepository.findByEmail("parent@erp.com");
                    if (existingGuardians.isEmpty()) {
                        com.erp.guardian.entity.Guardian g = new com.erp.guardian.entity.Guardian("Parent", "Sharma", "MOTHER", "+919811223366", "parent@erp.com");
                        g.setOccupation("Architect");
                        g.setAddress("Flat 402, Sunshine Heights, New Delhi");
                        g.setIsEmergencyContact(false);
                        g.setStudent(s1);
                        g.setUserId(parentUser.getId());
                        guardianRepository.save(g);
                    } else {
                        for (com.erp.guardian.entity.Guardian g : existingGuardians) {
                            if (g.getUserId() == null) {
                                g.setUserId(parentUser.getId());
                                guardianRepository.save(g);
                            }
                        }
                    }
                });
            });
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
