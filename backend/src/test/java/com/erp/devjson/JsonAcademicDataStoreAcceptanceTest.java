package com.erp.devjson;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.exception.ValidationException;
import com.erp.devjson.academic.JsonAcademicDataStoreManager;
import com.erp.devjson.model.AcademicJsonModels.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class JsonAcademicDataStoreAcceptanceTest {

    @TempDir
    Path isolatedStorageDir;

    @Test
    @DisplayName("Acceptance Test: Empty isolated JSON dataset creation, persistence, referential integrity, and survival across restart")
    void testFullAcademicWorkflowAndPersistenceAcrossRestart() throws IOException {
        // Step 1: Initialize fresh store in empty directory
        JsonAcademicDataStoreManager manager = new JsonAcademicDataStoreManager(isolatedStorageDir);

        // Verify initial state is completely empty
        assertEquals(0, manager.getAllDepartments().size());
        assertEquals(0, manager.getAllCourses().size());
        assertEquals(0, manager.getAllPrograms().size());

        // Step 2: Create Department
        DepartmentRecord dept = manager.saveDepartment(DepartmentRecord.builder()
                .name("Computer Science & Engineering")
                .code("CSE")
                .build());
        assertNotNull(dept.getId());
        assertEquals(1L, dept.getId());

        // Verify duplicate department code is rejected
        assertThrows(BusinessException.class, () ->
                manager.saveDepartment(DepartmentRecord.builder()
                        .name("Duplicate CS")
                        .code("CSE")
                        .build()));

        // Step 3: Create Academic Year
        AcademicYearRecord ay = manager.saveAcademicYear(AcademicYearRecord.builder()
                .name("2026-2027")
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2027, 5, 31))
                .build());
        assertNotNull(ay.getId());
        assertEquals(1L, ay.getId());

        // Step 4: Create Program referencing Department
        ProgramRecord prog = manager.saveProgram(ProgramRecord.builder()
                .name("Bachelor of Technology in CS")
                .code("BTECH-CS")
                .degree("B.Tech")
                .departmentId(dept.getId())
                .duration(4)
                .build());
        assertNotNull(prog.getId());
        assertEquals(1L, prog.getId());

        // Verify invalid department reference in program is rejected
        assertThrows(ResourceNotFoundException.class, () ->
                manager.saveProgram(ProgramRecord.builder()
                        .name("Invalid Prog")
                        .code("INV-01")
                        .degree("B.Tech")
                        .departmentId(9999L)
                        .duration(4)
                        .build()));

        // Step 5: Create Courses (Intro to Programming, Data Structures, Advanced Algorithms)
        CourseRecord cs101 = manager.saveCourse(CourseRecord.builder()
                .code("CS101")
                .name("Intro to Programming")
                .courseType("THEORY")
                .credits(3)
                .departmentId(dept.getId())
                .programId(prog.getId())
                .build());
        assertNotNull(cs101.getId());

        CourseRecord cs201 = manager.saveCourse(CourseRecord.builder()
                .code("CS201")
                .name("Data Structures")
                .courseType("THEORY")
                .credits(4)
                .departmentId(dept.getId())
                .programId(prog.getId())
                .build());
        assertNotNull(cs201.getId());

        CourseRecord cs301 = manager.saveCourse(CourseRecord.builder()
                .code("CS301")
                .name("Advanced Algorithms")
                .courseType("THEORY")
                .credits(4)
                .departmentId(dept.getId())
                .programId(prog.getId())
                .build());
        assertNotNull(cs301.getId());

        // Step 6: Create Prerequisites: CS201 requires CS101, CS301 requires CS201
        CoursePrerequisiteRecord req1 = manager.addCoursePrerequisite(cs201.getId(), cs101.getId());
        assertNotNull(req1.getId());

        CoursePrerequisiteRecord req2 = manager.addCoursePrerequisite(cs301.getId(), cs201.getId());
        assertNotNull(req2.getId());

        // Verify self-prerequisite is rejected
        assertThrows(ValidationException.class, () ->
                manager.addCoursePrerequisite(cs101.getId(), cs101.getId()));

        // Verify duplicate prerequisite is rejected
        assertThrows(BusinessException.class, () ->
                manager.addCoursePrerequisite(cs201.getId(), cs101.getId()));

        // Verify circular prerequisite is rejected (CS101 cannot require CS301 because CS301 -> CS201 -> CS101)
        BusinessException cycleEx = assertThrows(BusinessException.class, () ->
                manager.addCoursePrerequisite(cs101.getId(), cs301.getId()));
        assertTrue(cycleEx.getMessage().contains("Circular dependency detected"));

        // Step 7: Create Batch referencing Program
        BatchRecord batch = manager.saveBatch(BatchRecord.builder()
                .name("2026 CS Batch")
                .code("CS-2026")
                .programId(prog.getId())
                .admissionYear(2026)
                .graduationYear(2030)
                .academicYearId(ay.getId())
                .build());
        assertNotNull(batch.getId());

        // Step 8: Create Semester referencing Academic Year
        SemesterRecord sem = manager.saveSemester(SemesterRecord.builder()
                .name("Fall 2026")
                .semesterNumber(1)
                .academicYearId(ay.getId())
                .startDate(LocalDate.of(2026, 8, 15))
                .endDate(LocalDate.of(2026, 12, 20))
                .build());
        assertNotNull(sem.getId());

        // Step 9: Create Course Offering referencing Course and Semester
        CourseOfferingRecord offering = manager.saveOffering(CourseOfferingRecord.builder()
                .courseId(cs301.getId())
                .semesterId(sem.getId())
                .maxCapacity(60)
                .build());
        assertNotNull(offering.getId());

        // Verify invalid offering relationship is rejected
        assertThrows(ResourceNotFoundException.class, () ->
                manager.saveOffering(CourseOfferingRecord.builder()
                        .courseId(9999L)
                        .semesterId(sem.getId())
                        .maxCapacity(60)
                        .build()));

        // Step 10: Create Section referencing Course Offering
        SectionRecord section = manager.saveSection(SectionRecord.builder()
                .name("Section A")
                .courseOfferingId(offering.getId())
                .capacity(30)
                .build());
        assertNotNull(section.getId());

        // Verify invalid section relationship is rejected
        assertThrows(ResourceNotFoundException.class, () ->
                manager.saveSection(SectionRecord.builder()
                        .name("Invalid Section")
                        .courseOfferingId(8888L)
                        .capacity(30)
                        .build()));

        // Step 11: Verify real disk files exist and are not empty
        Path deptsFile = isolatedStorageDir.resolve("departments.json");
        Path coursesFile = isolatedStorageDir.resolve("courses.json");
        Path prereqsFile = isolatedStorageDir.resolve("course_prerequisites.json");
        Path sectionsFile = isolatedStorageDir.resolve("sections.json");

        assertTrue(Files.exists(deptsFile), "departments.json must exist on disk");
        assertTrue(Files.exists(coursesFile), "courses.json must exist on disk");
        assertTrue(Files.exists(prereqsFile), "course_prerequisites.json must exist on disk");
        assertTrue(Files.exists(sectionsFile), "sections.json must exist on disk");

        String deptsContent = Files.readString(deptsFile);
        assertTrue(deptsContent.contains("CSE"));
        assertTrue(deptsContent.contains("Computer Science & Engineering"));

        // Step 12: Application Restart Simulation
        // Create an entirely new manager instance pointing to the same folder
        JsonAcademicDataStoreManager rebootedManager = new JsonAcademicDataStoreManager(isolatedStorageDir);

        // Verify all entities survived the reboot
        assertEquals(1, rebootedManager.getAllDepartments().size());
        assertEquals("CSE", rebootedManager.getDepartmentById(1L).orElseThrow().getCode());

        assertEquals(3, rebootedManager.getAllCourses().size());
        assertEquals("CS101", rebootedManager.getCourseById(1L).orElseThrow().getCode());
        assertEquals("CS201", rebootedManager.getCourseById(2L).orElseThrow().getCode());
        assertEquals("CS301", rebootedManager.getCourseById(3L).orElseThrow().getCode());

        List<CoursePrerequisiteRecord> rebootedPrereqs = rebootedManager.getPrerequisitesForCourse(cs301.getId());
        assertEquals(1, rebootedPrereqs.size());
        assertEquals(cs201.getId(), rebootedPrereqs.get(0).getPrerequisiteCourseId());

        assertEquals(1, rebootedManager.getAllSections().size());
        assertEquals("Section A", rebootedManager.getAllSections().get(0).getName());

        // Verify sequence generation continues without collision after restart
        DepartmentRecord newDept = rebootedManager.saveDepartment(DepartmentRecord.builder()
                .name("Mechanical Engineering")
                .code("ME")
                .build());
        assertEquals(2L, newDept.getId(), "Next ID must be 2 after restart");
    }
}
