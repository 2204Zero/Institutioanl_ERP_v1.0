package com.erp.devjson.user;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.UserJsonModels.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@Profile("dev-json")
public class JsonUserDataStoreManager {

    private final JsonEntityStore<UserRecord> userStore;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public JsonUserDataStoreManager(DevJsonProperties properties) {
        this(properties.getStoragePath());
    }

    public JsonUserDataStoreManager(Path baseDirectory) {
        JsonFileStorageEngine engine = new JsonFileStorageEngine();
        this.userStore = new JsonEntityStore<>(
                baseDirectory.resolve("users.json"),
                UserRecord.class, engine,
                UserRecord::getId, UserRecord::setId);
    }

    public synchronized UserRecord createUser(String username, String email, String rawPassword, String role) {
        if (username == null || username.isBlank()) {
            throw new BusinessException("Username cannot be empty");
        }
        if (email == null || email.isBlank()) {
            throw new BusinessException("Email cannot be empty");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new BusinessException("Password cannot be empty");
        }

        String normUsername = username.trim().toLowerCase();
        String normEmail = email.trim().toLowerCase();

        boolean usernameExists = userStore.findAll().stream()
                .anyMatch(u -> u.getUsername().equalsIgnoreCase(normUsername));
        if (usernameExists) {
            throw new BusinessException("Username '" + username + "' is already taken");
        }

        boolean emailExists = userStore.findAll().stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(normEmail));
        if (emailExists) {
            throw new BusinessException("Email '" + email + "' is already registered");
        }

        UserRecord record = UserRecord.builder()
                .username(normUsername)
                .email(normEmail)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role != null ? role.toUpperCase() : "STUDENT")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userStore.save(record);
    }

    public Optional<UserRecord> getUserById(Long id) {
        return userStore.findById(id);
    }

    public Optional<UserRecord> getUserByUsername(String username) {
        if (username == null) return Optional.empty();
        return userStore.findAll().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username.trim()))
                .findFirst();
    }

    public Optional<UserRecord> getUserByEmail(String email) {
        if (email == null) return Optional.empty();
        return userStore.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst();
    }

    public boolean authenticate(String usernameOrEmail, String rawPassword) {
        if (usernameOrEmail == null || rawPassword == null) return false;
        Optional<UserRecord> userOpt = getUserByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) {
            userOpt = getUserByEmail(usernameOrEmail);
        }
        if (userOpt.isEmpty()) return false;
        UserRecord user = userOpt.get();
        if (!Boolean.TRUE.equals(user.getEnabled())) return false;
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public synchronized UserRecord setEnabled(Long id, boolean enabled) {
        UserRecord user = userStore.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(enabled);
        user.setUpdatedAt(LocalDateTime.now());
        return userStore.save(user);
    }

    public List<UserRecord> getAllUsers() {
        return userStore.findAll();
    }

    public long count() {
        return userStore.count();
    }

    public JsonEntityStore<UserRecord> getStore() {
        return userStore;
    }
}
