package com.erp.devjson;

import com.erp.common.exception.BusinessException;
import com.erp.devjson.model.StudentJsonModels.*;
import com.erp.devjson.student.JsonStudentDataStoreManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class JsonStudentLifecycleAcceptanceTest {

    @TempDir
    Path tempStorageDir;

    private JsonStudentDataStoreManager manager;

    @BeforeEach
    void setUp() {
        manager = new JsonStudentDataStoreManager(tempStorageDir);
    }

    @Test
    @DisplayName("Verify end-to-end JSON student lifecycle: Active -> Suspended -> Active -> Graduated -> Alumni, cold restart persistence & constraints")
    void testCompleteStudentLifecycleInJsonMode() {
        // 1. Create Student
        StudentRecord student = StudentRecord.builder()
                .rollNumber("2024-CSE-999")
                .firstName("Arjun")
                .lastName("Verma")
                .email("arjun.verma@college.edu")
                .phone("+919876543201")
                .dateOfBirth(LocalDate.of(2003, 5, 12))
                .gender("MALE")
                .department("Computer Science and Engineering")
                .program("B.Tech CSE")
                .batch("2024-2028")
                .enrollmentDate(LocalDate.of(2024, 8, 1))
                .build();

        StudentRecord created = manager.createStudent(student);
        assertNotNull(created.getId());
        assertEquals("ACTIVE", created.getStatus());

        List<StudentStatusHistoryRecord> history1 = manager.getStatusHistory(created.getId());
        assertEquals(1, history1.size());
        assertEquals("ACTIVE", history1.get(0).getNewStatus());
        assertNull(history1.get(0).getPreviousStatus());

        // 2. Transition ACTIVE -> SUSPENDED
        StudentRecord suspended = manager.updateStudentStatus(
                created.getId(),
                "SUSPENDED",
                "Attendance shortage below 60%",
                "dean_academics",
                LocalDate.now()
        );
        assertEquals("SUSPENDED", suspended.getStatus());
        List<StudentStatusHistoryRecord> history2 = manager.getStatusHistory(created.getId());
        assertEquals(2, history2.size());
        assertEquals("SUSPENDED", history2.get(0).getNewStatus());
        assertEquals("ACTIVE", history2.get(0).getPreviousStatus());

        // 3. Transition SUSPENDED -> ACTIVE (Reinstatement)
        StudentRecord reinstated = manager.updateStudentStatus(
                created.getId(),
                "ACTIVE",
                "Compensatory classes completed",
                "disciplinary_committee",
                LocalDate.now()
        );
        assertEquals("ACTIVE", reinstated.getStatus());
        assertEquals(3, manager.getStatusHistory(created.getId()).size());

        // 4. Reject premature Alumni transition from ACTIVE
        BusinessException exPremature = assertThrows(BusinessException.class, () -> {
            manager.updateStudentStatus(
                    created.getId(),
                    "ALUMNI",
                    "Direct to alumni without graduating",
                    "admin",
                    LocalDate.now()
            );
        });
        assertTrue(exPremature.getMessage().contains("Invalid status transition from ACTIVE to ALUMNI"));

        // 5. Transition ACTIVE -> GRADUATED
        StudentRecord graduated = manager.updateStudentStatus(
                created.getId(),
                "GRADUATED",
                "Degree requirements fulfilled with 8.9 CGPA",
                "controller_of_examinations",
                LocalDate.now()
        );
        assertEquals("GRADUATED", graduated.getStatus());
        assertEquals(4, manager.getStatusHistory(created.getId()).size());

        // 6. Transition GRADUATED -> ALUMNI
        StudentRecord alumni = manager.updateStudentStatus(
                created.getId(),
                "ALUMNI",
                "Convocation ceremony completed, enrolled in Alumni Portal",
                "alumni_relations_cell",
                LocalDate.now()
        );
        assertEquals("ALUMNI", alumni.getStatus());
        assertEquals(5, manager.getStatusHistory(created.getId()).size());

        // 7. Duplicate/repeated transition to ALUMNI is an idempotent no-op
        StudentRecord repeated = manager.updateStudentStatus(
                created.getId(),
                "ALUMNI",
                "Repeated alumni transition",
                "admin",
                LocalDate.now()
        );
        assertEquals("ALUMNI", repeated.getStatus());
        assertEquals(5, manager.getStatusHistory(created.getId()).size()); // History count unchanged

        // 8. Terminal state check: ALUMNI cannot transition to ACTIVE
        BusinessException exTerminal = assertThrows(BusinessException.class, () -> {
            manager.updateStudentStatus(
                    created.getId(),
                    "ACTIVE",
                    "Attempt reactivation from alumni",
                    "admin",
                    LocalDate.now()
            );
        });
        assertTrue(exTerminal.getMessage().contains("Invalid status transition from ALUMNI to ACTIVE"));

        // 9. COLD RESTART TEST: Reconstruct manager from files on disk
        JsonStudentDataStoreManager restartManager = new JsonStudentDataStoreManager(tempStorageDir);
        StudentRecord persisted = restartManager.getStudentById(created.getId()).orElse(null);
        assertNotNull(persisted);
        assertEquals("ALUMNI", persisted.getStatus());
        assertEquals("2024-CSE-999", persisted.getRollNumber());
        assertEquals("Arjun", persisted.getFirstName());

        List<StudentStatusHistoryRecord> persistedHistory = restartManager.getStatusHistory(created.getId());
        assertEquals(5, persistedHistory.size());
        assertEquals("ALUMNI", persistedHistory.get(0).getNewStatus());
        assertEquals("GRADUATED", persistedHistory.get(0).getPreviousStatus());

        // 10. Directory filtering test
        List<StudentRecord> alumniList = restartManager.getAllStudents(null, "ALUMNI", null);
        assertEquals(1, alumniList.size());
        assertEquals("Arjun", alumniList.get(0).getFirstName());

        List<StudentRecord> activeList = restartManager.getAllStudents(null, "ACTIVE", null);
        assertTrue(activeList.isEmpty());
    }
}
