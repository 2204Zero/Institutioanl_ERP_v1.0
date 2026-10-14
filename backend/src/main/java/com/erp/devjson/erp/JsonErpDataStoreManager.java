package com.erp.devjson.erp;

import com.erp.devjson.academic.JsonAcademicDataStoreManager;
import com.erp.devjson.admission.JsonAdmissionDataStoreManager;
import com.erp.devjson.attendance.JsonAttendanceDataStoreManager;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.dashboard.JsonDashboardDataStoreManager;
import com.erp.devjson.faculty.JsonFacultyDataStoreManager;
import com.erp.devjson.finance.JsonFinanceDataStoreManager;
import com.erp.devjson.guardian.JsonGuardianDataStoreManager;
import com.erp.devjson.notification.JsonNotificationDataStoreManager;
import com.erp.devjson.student.JsonStudentDataStoreManager;
import com.erp.devjson.timetable.JsonTimetableDataStoreManager;
import com.erp.devjson.user.JsonUserDataStoreManager;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;

@Getter
@Component
@Profile("dev-json")
public class JsonErpDataStoreManager {

    private final Path storageDirectory;
    private final JsonUserDataStoreManager userManager;
    private final JsonStudentDataStoreManager studentManager;
    private final JsonAcademicDataStoreManager academicManager;
    private final JsonGuardianDataStoreManager guardianManager;
    private final JsonFacultyDataStoreManager facultyManager;
    private final JsonTimetableDataStoreManager timetableManager;
    private final JsonAttendanceDataStoreManager attendanceManager;
    private final JsonFinanceDataStoreManager financeManager;
    private final JsonAdmissionDataStoreManager admissionManager;
    private final JsonNotificationDataStoreManager notificationManager;
    private final JsonDashboardDataStoreManager dashboardManager;

    @Autowired
    public JsonErpDataStoreManager(DevJsonProperties properties) {
        this(properties.getStoragePath());
    }

    public JsonErpDataStoreManager(Path baseDirectory) {
        this.storageDirectory = baseDirectory;
        this.userManager = new JsonUserDataStoreManager(baseDirectory);
        this.studentManager = new JsonStudentDataStoreManager(baseDirectory);
        this.academicManager = new JsonAcademicDataStoreManager(baseDirectory);
        this.guardianManager = new JsonGuardianDataStoreManager(baseDirectory, this.studentManager);
        this.facultyManager = new JsonFacultyDataStoreManager(baseDirectory, this.academicManager);
        this.timetableManager = new JsonTimetableDataStoreManager(baseDirectory, this.academicManager, this.facultyManager);
        this.attendanceManager = new JsonAttendanceDataStoreManager(baseDirectory, this.studentManager, this.timetableManager);
        this.financeManager = new JsonFinanceDataStoreManager(baseDirectory, this.studentManager, this.academicManager);
        this.admissionManager = new JsonAdmissionDataStoreManager(baseDirectory, this.academicManager, this.studentManager, this.userManager);
        this.notificationManager = new JsonNotificationDataStoreManager(baseDirectory);
        this.dashboardManager = new JsonDashboardDataStoreManager(
                this.studentManager, this.facultyManager, this.academicManager,
                this.financeManager, this.attendanceManager, this.timetableManager);
    }

    public void clearAll() {
        userManager.getStore().clear();
        studentManager.getStudentStore().clear();
        studentManager.getHistoryStore().clear();
        academicManager.getDepartmentStore().clear();
        academicManager.getAcademicYearStore().clear();
        academicManager.getProgramStore().clear();
        academicManager.getCourseStore().clear();
        academicManager.getPrerequisiteStore().clear();
        academicManager.getBatchStore().clear();
        academicManager.getSemesterStore().clear();
        academicManager.getOfferingStore().clear();
        academicManager.getSectionStore().clear();
        guardianManager.getStore().clear();
        facultyManager.getStore().clear();
        timetableManager.getStore().clear();
        attendanceManager.getStore().clear();
        financeManager.getFeeHeadStore().clear();
        financeManager.getFeeStructureStore().clear();
        financeManager.getStudentFeeStore().clear();
        financeManager.getPaymentStore().clear();
        financeManager.getReceiptStore().clear();
        admissionManager.getApplicantStore().clear();
        admissionManager.getApplicationStore().clear();
        notificationManager.getStore().clear();
    }
}
