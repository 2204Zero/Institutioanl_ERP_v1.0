package com.erp.devjson.dashboard;

import com.erp.devjson.academic.JsonAcademicDataStoreManager;
import com.erp.devjson.attendance.JsonAttendanceDataStoreManager;
import com.erp.devjson.faculty.JsonFacultyDataStoreManager;
import com.erp.devjson.finance.JsonFinanceDataStoreManager;
import com.erp.devjson.model.AttendanceJsonModels.StudentAttendanceSummary;
import com.erp.devjson.model.FinanceJsonModels.FinanceSummaryRecord;
import com.erp.devjson.model.FinanceJsonModels.StudentFeeRecord;
import com.erp.devjson.student.JsonStudentDataStoreManager;
import com.erp.devjson.timetable.JsonTimetableDataStoreManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Profile("dev-json")
public class JsonDashboardDataStoreManager {

    private final JsonStudentDataStoreManager studentManager;
    private final JsonFacultyDataStoreManager facultyManager;
    private final JsonAcademicDataStoreManager academicManager;
    private final JsonFinanceDataStoreManager financeManager;
    private final JsonAttendanceDataStoreManager attendanceManager;
    private final JsonTimetableDataStoreManager timetableManager;

    @Autowired
    public JsonDashboardDataStoreManager(
            JsonStudentDataStoreManager studentManager,
            JsonFacultyDataStoreManager facultyManager,
            JsonAcademicDataStoreManager academicManager,
            JsonFinanceDataStoreManager financeManager,
            JsonAttendanceDataStoreManager attendanceManager,
            JsonTimetableDataStoreManager timetableManager) {
        this.studentManager = studentManager;
        this.facultyManager = facultyManager;
        this.academicManager = academicManager;
        this.financeManager = financeManager;
        this.attendanceManager = attendanceManager;
        this.timetableManager = timetableManager;
    }

    public Map<String, Object> getManagementDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        long totalStudents = studentManager != null ? studentManager.count() : 0;
        long activeStudents = studentManager != null ? studentManager.getAllStudents(null, "ACTIVE", null).size() : 0;
        long alumniStudents = studentManager != null ? studentManager.getAllStudents(null, "ALUMNI", null).size() : 0;
        long totalFaculty = facultyManager != null ? facultyManager.count() : 0;
        long totalCourses = academicManager != null ? academicManager.getAllCourses().size() : 0;
        long totalDepartments = academicManager != null ? academicManager.getAllDepartments().size() : 0;

        metrics.put("totalStudents", totalStudents);
        metrics.put("activeStudents", activeStudents);
        metrics.put("alumniStudents", alumniStudents);
        metrics.put("totalFaculty", totalFaculty);
        metrics.put("totalCourses", totalCourses);
        metrics.put("totalDepartments", totalDepartments);

        if (financeManager != null) {
            FinanceSummaryRecord fin = financeManager.getFinancialSummary();
            metrics.put("totalGrossFees", fin.getTotalGrossAssigned());
            metrics.put("totalCollectedFees", fin.getTotalCollected());
            metrics.put("totalOutstandingFees", fin.getTotalOutstanding());
        }

        return metrics;
    }

    public Map<String, Object> getStudentDashboardMetrics(Long studentId) {
        Map<String, Object> metrics = new HashMap<>();
        if (studentId == null) return metrics;

        if (attendanceManager != null) {
            StudentAttendanceSummary att = attendanceManager.calculateStudentAttendanceSummary(studentId);
            metrics.put("attendancePercentage", att.getPercentage());
            metrics.put("attendedSessions", att.getAttendedSessions());
            metrics.put("totalSessions", att.getTotalSessions());
        }

        if (financeManager != null) {
            List<StudentFeeRecord> fees = financeManager.getStudentFeesByStudentId(studentId);
            BigDecimal totalDue = fees.stream()
                    .map(StudentFeeRecord::getOutstandingAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            metrics.put("outstandingFeeBalance", totalDue);
        }

        return metrics;
    }

    public Map<String, Object> getFacultyDashboardMetrics(Long facultyId) {
        Map<String, Object> metrics = new HashMap<>();
        if (facultyId == null) return metrics;

        if (facultyManager != null) {
            facultyManager.getFacultyById(facultyId).ifPresent(f -> {
                metrics.put("assignedSectionsCount", f.getAssignedSectionIds() != null ? f.getAssignedSectionIds().size() : 0);
            });
        }

        if (timetableManager != null) {
            var slots = timetableManager.getSlotsByFacultyId(facultyId);
            metrics.put("weeklyScheduleSlotsCount", slots.size());
        }

        return metrics;
    }
}
