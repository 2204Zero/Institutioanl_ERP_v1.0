package com.erp.devjson.guardian;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.GuardianJsonModels.GuardianRecord;
import com.erp.devjson.student.JsonStudentDataStoreManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Profile("dev-json")
public class JsonGuardianDataStoreManager {

    private final JsonEntityStore<GuardianRecord> guardianStore;
    private final JsonStudentDataStoreManager studentManager;

    @Autowired
    public JsonGuardianDataStoreManager(DevJsonProperties properties, JsonStudentDataStoreManager studentManager) {
        this(properties.getStoragePath(), studentManager);
    }

    public JsonGuardianDataStoreManager(Path baseDirectory, JsonStudentDataStoreManager studentManager) {
        this.studentManager = studentManager;
        JsonFileStorageEngine engine = new JsonFileStorageEngine();
        this.guardianStore = new JsonEntityStore<>(
                baseDirectory.resolve("guardians.json"),
                GuardianRecord.class, engine,
                GuardianRecord::getId, GuardianRecord::setId);
    }

    public synchronized GuardianRecord createGuardian(GuardianRecord guardian) {
        if (guardian.getName() == null || guardian.getName().isBlank()) {
            throw new BusinessException("Guardian name cannot be empty");
        }
        if (guardian.getEmail() == null || guardian.getEmail().isBlank()) {
            throw new BusinessException("Guardian email cannot be empty");
        }

        String normEmail = guardian.getEmail().trim().toLowerCase();
        boolean emailExists = guardianStore.findAll().stream()
                .anyMatch(g -> g.getEmail().equalsIgnoreCase(normEmail));
        if (emailExists) {
            throw new BusinessException("A guardian with email '" + guardian.getEmail() + "' already exists");
        }

        if (guardian.getWardStudentIds() != null && studentManager != null) {
            for (Long wardId : guardian.getWardStudentIds()) {
                if (studentManager.getStudentById(wardId).isEmpty()) {
                    throw new ResourceNotFoundException("Student ward not found with id: " + wardId);
                }
            }
        }

        guardian.setEmail(normEmail);
        if (guardian.getWardStudentIds() == null) {
            guardian.setWardStudentIds(new ArrayList<>());
        }
        return guardianStore.save(guardian);
    }

    public Optional<GuardianRecord> getGuardianById(Long id) {
        return guardianStore.findById(id);
    }

    public Optional<GuardianRecord> getGuardianByEmail(String email) {
        if (email == null) return Optional.empty();
        return guardianStore.findAll().stream()
                .filter(g -> g.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst();
    }

    public Optional<GuardianRecord> getGuardianByUserId(Long userId) {
        if (userId == null) return Optional.empty();
        return guardianStore.findAll().stream()
                .filter(g -> userId.equals(g.getUserId()))
                .findFirst();
    }

    public synchronized GuardianRecord linkWard(Long guardianId, Long studentId) {
        GuardianRecord guardian = guardianStore.findById(guardianId)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian not found with id: " + guardianId));
        if (studentManager != null && studentManager.getStudentById(studentId).isEmpty()) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        List<Long> wardIds = guardian.getWardStudentIds() != null
                ? new ArrayList<>(guardian.getWardStudentIds())
                : new ArrayList<>();
        if (!wardIds.contains(studentId)) {
            wardIds.add(studentId);
            guardian.setWardStudentIds(wardIds);
            guardian = guardianStore.save(guardian);
        }
        return guardian;
    }

    public List<GuardianRecord> getAllGuardians() {
        return guardianStore.findAll();
    }

    public long count() {
        return guardianStore.count();
    }

    public JsonEntityStore<GuardianRecord> getStore() {
        return guardianStore;
    }
}
