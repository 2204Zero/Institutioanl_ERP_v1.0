package com.erp.devjson.faculty;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.academic.JsonAcademicDataStoreManager;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.FacultyJsonModels.FacultyRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Profile("dev-json")
public class JsonFacultyDataStoreManager {

    private final JsonEntityStore<FacultyRecord> facultyStore;
    private final JsonAcademicDataStoreManager academicManager;

    @Autowired
    public JsonFacultyDataStoreManager(DevJsonProperties properties, JsonAcademicDataStoreManager academicManager) {
        this(properties.getStoragePath(), academicManager);
    }

    public JsonFacultyDataStoreManager(Path baseDirectory, JsonAcademicDataStoreManager academicManager) {
        this.academicManager = academicManager;
        JsonFileStorageEngine engine = new JsonFileStorageEngine();
        this.facultyStore = new JsonEntityStore<>(
                baseDirectory.resolve("faculty.json"),
                FacultyRecord.class, engine,
                FacultyRecord::getId, FacultyRecord::setId);
    }

    public synchronized FacultyRecord createFaculty(FacultyRecord faculty) {
        if (faculty.getEmployeeId() == null || faculty.getEmployeeId().isBlank()) {
            throw new BusinessException("Faculty employee ID cannot be empty");
        }
        if (faculty.getEmail() == null || faculty.getEmail().isBlank()) {
            throw new BusinessException("Faculty email cannot be empty");
        }

        String normEmpId = faculty.getEmployeeId().trim().toUpperCase();
        String normEmail = faculty.getEmail().trim().toLowerCase();

        boolean empExists = facultyStore.findAll().stream()
                .anyMatch(f -> f.getEmployeeId().equalsIgnoreCase(normEmpId));
        if (empExists) {
            throw new BusinessException("Faculty employee ID '" + faculty.getEmployeeId() + "' already exists");
        }

        boolean emailExists = facultyStore.findAll().stream()
                .anyMatch(f -> f.getEmail().equalsIgnoreCase(normEmail));
        if (emailExists) {
            throw new BusinessException("Faculty email '" + faculty.getEmail() + "' already exists");
        }

        if (faculty.getDepartmentId() != null && academicManager != null) {
            if (academicManager.getDepartmentById(faculty.getDepartmentId()).isEmpty()) {
                throw new ResourceNotFoundException("Department not found with id: " + faculty.getDepartmentId());
            }
        }

        faculty.setEmployeeId(normEmpId);
        faculty.setEmail(normEmail);
        if (faculty.getAssignedSectionIds() == null) {
            faculty.setAssignedSectionIds(new ArrayList<>());
        }
        return facultyStore.save(faculty);
    }

    public Optional<FacultyRecord> getFacultyById(Long id) {
        return facultyStore.findById(id);
    }

    public Optional<FacultyRecord> getFacultyByEmployeeId(String employeeId) {
        if (employeeId == null) return Optional.empty();
        return facultyStore.findAll().stream()
                .filter(f -> f.getEmployeeId().equalsIgnoreCase(employeeId.trim()))
                .findFirst();
    }

    public Optional<FacultyRecord> getFacultyByEmail(String email) {
        if (email == null) return Optional.empty();
        return facultyStore.findAll().stream()
                .filter(f -> f.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst();
    }

    public Optional<FacultyRecord> getFacultyByUserId(Long userId) {
        if (userId == null) return Optional.empty();
        return facultyStore.findAll().stream()
                .filter(f -> userId.equals(f.getUserId()))
                .findFirst();
    }

    public synchronized FacultyRecord assignSection(Long facultyId, Long sectionId) {
        FacultyRecord faculty = facultyStore.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + facultyId));
        if (academicManager != null && academicManager.getSectionById(sectionId).isEmpty()) {
            throw new ResourceNotFoundException("Section not found with id: " + sectionId);
        }
        List<Long> sectionIds = faculty.getAssignedSectionIds() != null
                ? new ArrayList<>(faculty.getAssignedSectionIds())
                : new ArrayList<>();
        if (!sectionIds.contains(sectionId)) {
            sectionIds.add(sectionId);
            faculty.setAssignedSectionIds(sectionIds);
            faculty = facultyStore.save(faculty);
        }
        return faculty;
    }

    public List<FacultyRecord> getAllFaculty() {
        return facultyStore.findAll();
    }

    public long count() {
        return facultyStore.count();
    }

    public JsonEntityStore<FacultyRecord> getStore() {
        return facultyStore;
    }
}
