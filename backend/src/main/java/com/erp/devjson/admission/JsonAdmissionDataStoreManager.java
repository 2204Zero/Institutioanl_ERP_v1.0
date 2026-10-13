package com.erp.devjson.admission;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.academic.JsonAcademicDataStoreManager;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.AdmissionJsonModels.*;
import com.erp.devjson.model.StudentJsonModels.StudentRecord;
import com.erp.devjson.student.JsonStudentDataStoreManager;
import com.erp.devjson.user.JsonUserDataStoreManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Component
@Profile("dev-json")
public class JsonAdmissionDataStoreManager {

    private final JsonEntityStore<ApplicantRecord> applicantStore;
    private final JsonEntityStore<AdmissionApplicationRecord> applicationStore;

    private final JsonAcademicDataStoreManager academicManager;
    private final JsonStudentDataStoreManager studentManager;
    private final JsonUserDataStoreManager userManager;

    private final ConcurrentHashMap<Long, ReentrantLock> applicationLocks = new ConcurrentHashMap<>();

    @Autowired
    public JsonAdmissionDataStoreManager(
            DevJsonProperties properties,
            JsonAcademicDataStoreManager academicManager,
            JsonStudentDataStoreManager studentManager,
            JsonUserDataStoreManager userManager) {
        this(properties.getStoragePath(), academicManager, studentManager, userManager);
    }

    public JsonAdmissionDataStoreManager(
            Path baseDirectory,
            JsonAcademicDataStoreManager academicManager,
            JsonStudentDataStoreManager studentManager,
            JsonUserDataStoreManager userManager) {
        this.academicManager = academicManager;
        this.studentManager = studentManager;
        this.userManager = userManager;
        JsonFileStorageEngine engine = new JsonFileStorageEngine();

        this.applicantStore = new JsonEntityStore<>(
                baseDirectory.resolve("applicants.json"),
                ApplicantRecord.class, engine,
                ApplicantRecord::getId, ApplicantRecord::setId);

        this.applicationStore = new JsonEntityStore<>(
                baseDirectory.resolve("admission_applications.json"),
                AdmissionApplicationRecord.class, engine,
                AdmissionApplicationRecord::getId, AdmissionApplicationRecord::setId);
    }

    private ReentrantLock getLock(Long applicationId) {
        return applicationLocks.computeIfAbsent(applicationId, k -> new ReentrantLock());
    }

    // --- Applicant ---
    public synchronized ApplicantRecord createApplicant(ApplicantRecord applicant) {
        if (applicant.getFirstName() == null || applicant.getFirstName().isBlank()) {
            throw new BusinessException("Applicant first name is required");
        }
        if (applicant.getLastName() == null || applicant.getLastName().isBlank()) {
            throw new BusinessException("Applicant last name is required");
        }
        if (applicant.getEmail() == null || applicant.getEmail().isBlank()) {
            throw new BusinessException("Applicant email is required");
        }

        String normEmail = applicant.getEmail().trim().toLowerCase();
        boolean emailExists = applicantStore.findAll().stream()
                .anyMatch(a -> a.getEmail().equalsIgnoreCase(normEmail));
        if (emailExists) {
            throw new BusinessException("An applicant with email '" + applicant.getEmail() + "' already exists");
        }

        applicant.setEmail(normEmail);
        return applicantStore.save(applicant);
    }

    public Optional<ApplicantRecord> getApplicantById(Long id) {
        return applicantStore.findById(id);
    }

    // --- Application ---
    public synchronized AdmissionApplicationRecord createDraftApplication(Long applicantId, Long programId, Long academicYearId) {
        if (applicantStore.findById(applicantId).isEmpty()) {
            throw new ResourceNotFoundException("Applicant not found with id: " + applicantId);
        }
        if (academicManager != null && academicManager.getProgramById(programId).isEmpty()) {
            throw new ResourceNotFoundException("Program not found with id: " + programId);
        }
        if (academicManager != null && academicManager.getAcademicYearById(academicYearId).isEmpty()) {
            throw new ResourceNotFoundException("Academic year not found with id: " + academicYearId);
        }

        String appNumber = "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        AdmissionApplicationRecord app = AdmissionApplicationRecord.builder()
                .applicationNumber(appNumber)
                .applicantId(applicantId)
                .programId(programId)
                .academicYearId(academicYearId)
                .status("DRAFT")
                .createdAt(Instant.now())
                .build();

        return applicationStore.save(app);
    }

    public AdmissionApplicationRecord submitApplication(Long applicationId) {
        ReentrantLock lock = getLock(applicationId);
        lock.lock();
        try {
            AdmissionApplicationRecord app = applicationStore.findById(applicationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));
            if (!"DRAFT".equalsIgnoreCase(app.getStatus())) {
                throw new BusinessException("Only DRAFT applications can be submitted");
            }
            app.setStatus("SUBMITTED");
            app.setSubmittedAt(Instant.now());
            return applicationStore.save(app);
        } finally {
            lock.unlock();
        }
    }

    public AdmissionApplicationRecord updateStatus(Long applicationId, String newStatus, String remarks) {
        ReentrantLock lock = getLock(applicationId);
        lock.lock();
        try {
            AdmissionApplicationRecord app = applicationStore.findById(applicationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

            if ("REJECTED".equalsIgnoreCase(app.getStatus()) && "ADMITTED".equalsIgnoreCase(newStatus)) {
                throw new BusinessException("Cannot directly admit a rejected application");
            }
            if ("DRAFT".equalsIgnoreCase(app.getStatus()) && "ADMITTED".equalsIgnoreCase(newStatus)) {
                throw new BusinessException("Draft applications must be submitted before admission");
            }

            app.setStatus(newStatus.toUpperCase());
            app.setReviewerRemarks(remarks);
            return applicationStore.save(app);
        } finally {
            lock.unlock();
        }
    }

    /**
     * Converts an ADMITTED application into an active student record and login account
     */
    public synchronized StudentRecord onboardAdmittedStudent(Long applicationId) {
        ReentrantLock lock = getLock(applicationId);
        lock.lock();
        try {
            AdmissionApplicationRecord app = applicationStore.findById(applicationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

            if (!"ADMITTED".equalsIgnoreCase(app.getStatus())) {
                throw new BusinessException("Only ADMITTED applications can be converted to students");
            }

            ApplicantRecord applicant = applicantStore.findById(app.getApplicantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

            String rollNumber = "STU-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            String institutionalEmail = (applicant.getFirstName() + "." + applicant.getLastName()).toLowerCase().replaceAll("[^a-z0-9.]", "") + "@institution.edu";

            Long userId = null;
            if (userManager != null) {
                var user = userManager.createUser(rollNumber.toLowerCase(), institutionalEmail, "Student@123", "STUDENT");
                userId = user.getId();
            }

            StudentRecord student = StudentRecord.builder()
                    .rollNumber(rollNumber)
                    .firstName(applicant.getFirstName())
                    .lastName(applicant.getLastName())
                    .email(institutionalEmail)
                    .phone(applicant.getPhone())
                    .dateOfBirth(applicant.getDateOfBirth())
                    .gender(applicant.getGender())
                    .department("Computer Science & Engineering")
                    .program("B.Tech")
                    .batch("Batch-" + LocalDate.now().getYear())
                    .enrollmentDate(LocalDate.now())
                    .userId(userId)
                    .status("ACTIVE")
                    .build();

            return studentManager.createStudent(student);
        } finally {
            lock.unlock();
        }
    }

    public Optional<AdmissionApplicationRecord> getApplicationById(Long id) {
        return applicationStore.findById(id);
    }

    public List<AdmissionApplicationRecord> getAllApplications() {
        return applicationStore.findAll();
    }

    public JsonEntityStore<ApplicantRecord> getApplicantStore() { return applicantStore; }
    public JsonEntityStore<AdmissionApplicationRecord> getApplicationStore() { return applicationStore; }
}
