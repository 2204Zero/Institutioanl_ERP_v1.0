package com.erp.devjson.academic;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.exception.ValidationException;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.AcademicJsonModels.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.*;

@Component
@Profile("dev-json")
public class JsonAcademicDataStoreManager {

    private final JsonEntityStore<DepartmentRecord> departmentStore;
    private final JsonEntityStore<AcademicYearRecord> academicYearStore;
    private final JsonEntityStore<ProgramRecord> programStore;
    private final JsonEntityStore<CourseRecord> courseStore;
    private final JsonEntityStore<CoursePrerequisiteRecord> prerequisiteStore;
    private final JsonEntityStore<BatchRecord> batchStore;
    private final JsonEntityStore<SemesterRecord> semesterStore;
    private final JsonEntityStore<CourseOfferingRecord> offeringStore;
    private final JsonEntityStore<SectionRecord> sectionStore;

    @Autowired
    public JsonAcademicDataStoreManager(DevJsonProperties properties) {
        this(properties.getStoragePath());
    }

    public JsonAcademicDataStoreManager(Path baseDirectory) {
        JsonFileStorageEngine engine = new JsonFileStorageEngine();

        this.departmentStore = new JsonEntityStore<>(
                baseDirectory.resolve("departments.json"),
                DepartmentRecord.class, engine,
                DepartmentRecord::getId, DepartmentRecord::setId);

        this.academicYearStore = new JsonEntityStore<>(
                baseDirectory.resolve("academic_years.json"),
                AcademicYearRecord.class, engine,
                AcademicYearRecord::getId, AcademicYearRecord::setId);

        this.programStore = new JsonEntityStore<>(
                baseDirectory.resolve("programs.json"),
                ProgramRecord.class, engine,
                ProgramRecord::getId, ProgramRecord::setId);

        this.courseStore = new JsonEntityStore<>(
                baseDirectory.resolve("courses.json"),
                CourseRecord.class, engine,
                CourseRecord::getId, CourseRecord::setId);

        this.prerequisiteStore = new JsonEntityStore<>(
                baseDirectory.resolve("course_prerequisites.json"),
                CoursePrerequisiteRecord.class, engine,
                CoursePrerequisiteRecord::getId, CoursePrerequisiteRecord::setId);

        this.batchStore = new JsonEntityStore<>(
                baseDirectory.resolve("batches.json"),
                BatchRecord.class, engine,
                BatchRecord::getId, BatchRecord::setId);

        this.semesterStore = new JsonEntityStore<>(
                baseDirectory.resolve("semesters.json"),
                SemesterRecord.class, engine,
                SemesterRecord::getId, SemesterRecord::setId);

        this.offeringStore = new JsonEntityStore<>(
                baseDirectory.resolve("course_offerings.json"),
                CourseOfferingRecord.class, engine,
                CourseOfferingRecord::getId, CourseOfferingRecord::setId);

        this.sectionStore = new JsonEntityStore<>(
                baseDirectory.resolve("sections.json"),
                SectionRecord.class, engine,
                SectionRecord::getId, SectionRecord::setId);
    }

    // --- Department ---
    public DepartmentRecord saveDepartment(DepartmentRecord dept) {
        if (dept.getName() == null || dept.getName().isBlank()) {
            throw new ValidationException("Department name is required");
        }
        if (dept.getCode() == null || dept.getCode().isBlank()) {
            throw new ValidationException("Department code is required");
        }
        // Duplicate code check
        boolean duplicate = departmentStore.findAll().stream()
                .anyMatch(d -> d.getCode().equalsIgnoreCase(dept.getCode()) && !Objects.equals(d.getId(), dept.getId()));
        if (duplicate) {
            throw new BusinessException("Department code already exists: " + dept.getCode());
        }
        return departmentStore.save(dept);
    }

    public List<DepartmentRecord> getAllDepartments() {
        return departmentStore.findAll();
    }

    public Optional<DepartmentRecord> getDepartmentById(Long id) {
        return departmentStore.findById(id);
    }

    // --- Academic Year ---
    public AcademicYearRecord saveAcademicYear(AcademicYearRecord ay) {
        if (ay.getName() == null || ay.getName().isBlank()) {
            throw new ValidationException("Academic Year name is required");
        }
        if (ay.getStartDate() == null || ay.getEndDate() == null) {
            throw new ValidationException("Start and End dates are required");
        }
        if (ay.getStartDate().isAfter(ay.getEndDate())) {
            throw new ValidationException("Start date cannot be after end date");
        }
        return academicYearStore.save(ay);
    }

    public List<AcademicYearRecord> getAllAcademicYears() {
        return academicYearStore.findAll();
    }

    public Optional<AcademicYearRecord> getAcademicYearById(Long id) {
        return academicYearStore.findById(id);
    }

    // --- Program ---
    public ProgramRecord saveProgram(ProgramRecord prog) {
        if (prog.getName() == null || prog.getCode() == null || prog.getDepartmentId() == null) {
            throw new ValidationException("Program name, code, and department ID are required");
        }
        // Referential Integrity: Department must exist
        if (!departmentStore.existsById(prog.getDepartmentId())) {
            throw new ResourceNotFoundException("Referenced department not found: " + prog.getDepartmentId());
        }
        boolean duplicate = programStore.findAll().stream()
                .anyMatch(p -> p.getCode().equalsIgnoreCase(prog.getCode()) && !Objects.equals(p.getId(), prog.getId()));
        if (duplicate) {
            throw new BusinessException("Program code already exists: " + prog.getCode());
        }
        return programStore.save(prog);
    }

    public List<ProgramRecord> getAllPrograms() {
        return programStore.findAll();
    }

    public Optional<ProgramRecord> getProgramById(Long id) {
        return programStore.findById(id);
    }

    // --- Course ---
    public CourseRecord saveCourse(CourseRecord course) {
        if (course.getName() == null || course.getCode() == null || course.getDepartmentId() == null) {
            throw new ValidationException("Course name, code, and department ID are required");
        }
        // Referential Integrity: Department must exist
        if (!departmentStore.existsById(course.getDepartmentId())) {
            throw new ResourceNotFoundException("Referenced department not found: " + course.getDepartmentId());
        }
        // Optional Program reference check
        if (course.getProgramId() != null && !programStore.existsById(course.getProgramId())) {
            throw new ResourceNotFoundException("Referenced program not found: " + course.getProgramId());
        }
        boolean duplicate = courseStore.findAll().stream()
                .anyMatch(c -> c.getCode().equalsIgnoreCase(course.getCode()) && !Objects.equals(c.getId(), course.getId()));
        if (duplicate) {
            throw new BusinessException("Course code already exists: " + course.getCode());
        }
        return courseStore.save(course);
    }

    public List<CourseRecord> getAllCourses() {
        return courseStore.findAll();
    }

    public Optional<CourseRecord> getCourseById(Long id) {
        return courseStore.findById(id);
    }

    // --- Course Prerequisites ---
    public CoursePrerequisiteRecord addCoursePrerequisite(Long courseId, Long prerequisiteCourseId) {
        if (Objects.equals(courseId, prerequisiteCourseId)) {
            throw new ValidationException("A course cannot be a prerequisite for itself.");
        }
        if (!courseStore.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found: " + courseId);
        }
        if (!courseStore.existsById(prerequisiteCourseId)) {
            throw new ResourceNotFoundException("Prerequisite course not found: " + prerequisiteCourseId);
        }

        // Check duplicate
        boolean exists = prerequisiteStore.findAll().stream()
                .anyMatch(p -> p.getCourseId().equals(courseId) && p.getPrerequisiteCourseId().equals(prerequisiteCourseId));
        if (exists) {
            throw new BusinessException("This prerequisite already exists.");
        }

        // Circular dependency check
        if (hasCircularPrerequisite(prerequisiteCourseId, courseId)) {
            throw new BusinessException("Circular dependency detected: The prerequisite course already relies on this course.");
        }

        CoursePrerequisiteRecord record = CoursePrerequisiteRecord.builder()
                .courseId(courseId)
                .prerequisiteCourseId(prerequisiteCourseId)
                .build();
        return prerequisiteStore.save(record);
    }

    public List<CoursePrerequisiteRecord> getPrerequisitesForCourse(Long courseId) {
        return prerequisiteStore.findAll().stream()
                .filter(p -> p.getCourseId().equals(courseId))
                .toList();
    }

    public void removePrerequisite(Long courseId, Long prerequisiteCourseId) {
        CoursePrerequisiteRecord target = prerequisiteStore.findAll().stream()
                .filter(p -> p.getCourseId().equals(courseId) && p.getPrerequisiteCourseId().equals(prerequisiteCourseId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Prerequisite mapping not found"));
        prerequisiteStore.deleteById(target.getId());
    }

    private boolean hasCircularPrerequisite(Long currentCourseId, Long targetCourseId) {
        Set<Long> visited = new HashSet<>();
        return checkPrereqCycle(currentCourseId, targetCourseId, visited);
    }

    private boolean checkPrereqCycle(Long currentCourseId, Long targetCourseId, Set<Long> visited) {
        if (currentCourseId.equals(targetCourseId)) return true;
        if (!visited.add(currentCourseId)) return false;

        List<CoursePrerequisiteRecord> reqs = getPrerequisitesForCourse(currentCourseId);
        for (CoursePrerequisiteRecord req : reqs) {
            if (checkPrereqCycle(req.getPrerequisiteCourseId(), targetCourseId, visited)) {
                return true;
            }
        }
        return false;
    }

    // --- Batch ---
    public BatchRecord saveBatch(BatchRecord batch) {
        if (batch.getName() == null || batch.getCode() == null || batch.getProgramId() == null) {
            throw new ValidationException("Batch name, code, and program ID are required");
        }
        if (!programStore.existsById(batch.getProgramId())) {
            throw new ResourceNotFoundException("Referenced program not found: " + batch.getProgramId());
        }
        if (batch.getAcademicYearId() != null && !academicYearStore.existsById(batch.getAcademicYearId())) {
            throw new ResourceNotFoundException("Referenced academic year not found: " + batch.getAcademicYearId());
        }
        return batchStore.save(batch);
    }

    public List<BatchRecord> getAllBatches() {
        return batchStore.findAll();
    }

    // --- Semester ---
    public SemesterRecord saveSemester(SemesterRecord sem) {
        if (sem.getName() == null || sem.getAcademicYearId() == null) {
            throw new ValidationException("Semester name and academic year ID are required");
        }
        if (!academicYearStore.existsById(sem.getAcademicYearId())) {
            throw new ResourceNotFoundException("Referenced academic year not found: " + sem.getAcademicYearId());
        }
        return semesterStore.save(sem);
    }

    public List<SemesterRecord> getAllSemesters() {
        return semesterStore.findAll();
    }

    // --- Course Offering ---
    public CourseOfferingRecord saveOffering(CourseOfferingRecord offering) {
        if (offering.getCourseId() == null || offering.getSemesterId() == null) {
            throw new ValidationException("Course ID and Semester ID are required");
        }
        if (!courseStore.existsById(offering.getCourseId())) {
            throw new ResourceNotFoundException("Referenced course not found: " + offering.getCourseId());
        }
        if (!semesterStore.existsById(offering.getSemesterId())) {
            throw new ResourceNotFoundException("Referenced semester not found: " + offering.getSemesterId());
        }
        return offeringStore.save(offering);
    }

    public List<CourseOfferingRecord> getAllOfferings() {
        return offeringStore.findAll();
    }

    // --- Section ---
    public SectionRecord saveSection(SectionRecord sec) {
        if (sec.getName() == null || sec.getCourseOfferingId() == null) {
            throw new ValidationException("Section name and course offering ID are required");
        }
        if (!offeringStore.existsById(sec.getCourseOfferingId())) {
            throw new ResourceNotFoundException("Referenced course offering not found: " + sec.getCourseOfferingId());
        }
        return sectionStore.save(sec);
    }

    public List<SectionRecord> getAllSections() {
        return sectionStore.findAll();
    }

    public Optional<SectionRecord> getSectionById(Long id) {
        if (id == null) return Optional.empty();
        return sectionStore.findById(id);
    }

    // Store Accessors for Acceptance Tests
    public JsonEntityStore<DepartmentRecord> getDepartmentStore() { return departmentStore; }
    public JsonEntityStore<AcademicYearRecord> getAcademicYearStore() { return academicYearStore; }
    public JsonEntityStore<ProgramRecord> getProgramStore() { return programStore; }
    public JsonEntityStore<CourseRecord> getCourseStore() { return courseStore; }
    public JsonEntityStore<CoursePrerequisiteRecord> getPrerequisiteStore() { return prerequisiteStore; }
    public JsonEntityStore<BatchRecord> getBatchStore() { return batchStore; }
    public JsonEntityStore<SemesterRecord> getSemesterStore() { return semesterStore; }
    public JsonEntityStore<CourseOfferingRecord> getOfferingStore() { return offeringStore; }
    public JsonEntityStore<SectionRecord> getSectionStore() { return sectionStore; }
}
