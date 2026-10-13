package com.erp.devjson.sync;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.entity.CoursePrerequisite;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.program.entity.Program;
import com.erp.academic.section.entity.Section;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.attendance.entity.StudentAttendanceRecord;
import com.erp.auth.entity.AppUser;
import com.erp.department.entity.Department;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.AcademicJsonModels.*;
import com.erp.devjson.model.AdmissionJsonModels.*;
import com.erp.devjson.model.AttendanceJsonModels.AttendanceRecord;
import com.erp.devjson.model.FacultyJsonModels.FacultyRecord;
import com.erp.devjson.model.FinanceJsonModels.*;
import com.erp.devjson.model.GuardianJsonModels.GuardianRecord;
import com.erp.devjson.model.RegistrationJsonModels.*;
import com.erp.devjson.model.StudentJsonModels.*;
import com.erp.devjson.model.TimetableJsonModels.TimetableSlotRecord;
import com.erp.devjson.model.UserJsonModels.UserRecord;
import com.erp.faculty.entity.Faculty;
import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.invoice.entity.Receipt;
import com.erp.finance.payment.entity.Payment;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.guardian.entity.Guardian;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatusHistory;
import org.hibernate.event.spi.*;
import org.hibernate.persister.entity.EntityPersister;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@Profile("dev-json")
public class DevJsonSyncEngine implements PostInsertEventListener, PostUpdateEventListener, PostDeleteEventListener {

    private static final Logger log = LoggerFactory.getLogger(DevJsonSyncEngine.class);

    private final Path storageDir;
    private final JsonFileStorageEngine storageEngine = new JsonFileStorageEngine();

    // Stores
    private final JsonEntityStore<UserRecord> userStore;
    private final JsonEntityStore<StudentRecord> studentStore;
    private final JsonEntityStore<StudentStatusHistoryRecord> historyStore;
    private final JsonEntityStore<GuardianRecord> guardianStore;
    private final JsonEntityStore<FacultyRecord> facultyStore;
    private final JsonEntityStore<DepartmentRecord> departmentStore;
    private final JsonEntityStore<AcademicYearRecord> academicYearStore;
    private final JsonEntityStore<ProgramRecord> programStore;
    private final JsonEntityStore<CourseRecord> courseStore;
    private final JsonEntityStore<CoursePrerequisiteRecord> prerequisiteStore;
    private final JsonEntityStore<BatchRecord> batchStore;
    private final JsonEntityStore<SemesterRecord> semesterStore;
    private final JsonEntityStore<CourseOfferingRecord> offeringStore;
    private final JsonEntityStore<SectionRecord> sectionStore;
    private final JsonEntityStore<SectionFacultyRecord> sectionFacultyStore;
    private final JsonEntityStore<SectionStudentRecord> sectionStudentStore;
    private final JsonEntityStore<TimetableSlotRecord> timetableStore;
    private final JsonEntityStore<AttendanceRecord> attendanceStore;
    private final JsonEntityStore<CourseRegistrationRecord> registrationStore;
    private final JsonEntityStore<FeeHeadRecord> feeHeadStore;
    private final JsonEntityStore<FeeStructureRecord> feeStructureStore;
    private final JsonEntityStore<StudentFeeRecord> studentFeeStore;
    private final JsonEntityStore<PaymentRecord> paymentStore;
    private final JsonEntityStore<ReceiptRecord> receiptStore;
    private final JsonEntityStore<ApplicantRecord> applicantStore;
    private final JsonEntityStore<AdmissionApplicationRecord> applicationStore;
    private final JsonEntityStore<RoomRecord> roomStore;

    @Autowired
    public DevJsonSyncEngine(DevJsonProperties properties) {
        this.storageDir = properties.getStoragePath();

        this.userStore = new JsonEntityStore<>(storageDir.resolve("users.json"), UserRecord.class, storageEngine, UserRecord::getId, UserRecord::setId);
        this.studentStore = new JsonEntityStore<>(storageDir.resolve("students.json"), StudentRecord.class, storageEngine, StudentRecord::getId, StudentRecord::setId);
        this.historyStore = new JsonEntityStore<>(storageDir.resolve("student_status_history.json"), StudentStatusHistoryRecord.class, storageEngine, StudentStatusHistoryRecord::getId, StudentStatusHistoryRecord::setId);
        this.guardianStore = new JsonEntityStore<>(storageDir.resolve("guardians.json"), GuardianRecord.class, storageEngine, GuardianRecord::getId, GuardianRecord::setId);
        this.facultyStore = new JsonEntityStore<>(storageDir.resolve("faculty.json"), FacultyRecord.class, storageEngine, FacultyRecord::getId, FacultyRecord::setId);
        this.departmentStore = new JsonEntityStore<>(storageDir.resolve("departments.json"), DepartmentRecord.class, storageEngine, DepartmentRecord::getId, DepartmentRecord::setId);
        this.academicYearStore = new JsonEntityStore<>(storageDir.resolve("academic_years.json"), AcademicYearRecord.class, storageEngine, AcademicYearRecord::getId, AcademicYearRecord::setId);
        this.programStore = new JsonEntityStore<>(storageDir.resolve("programs.json"), ProgramRecord.class, storageEngine, ProgramRecord::getId, ProgramRecord::setId);
        this.courseStore = new JsonEntityStore<>(storageDir.resolve("courses.json"), CourseRecord.class, storageEngine, CourseRecord::getId, CourseRecord::setId);
        this.prerequisiteStore = new JsonEntityStore<>(storageDir.resolve("course_prerequisites.json"), CoursePrerequisiteRecord.class, storageEngine, CoursePrerequisiteRecord::getId, CoursePrerequisiteRecord::setId);
        this.batchStore = new JsonEntityStore<>(storageDir.resolve("batches.json"), BatchRecord.class, storageEngine, BatchRecord::getId, BatchRecord::setId);
        this.semesterStore = new JsonEntityStore<>(storageDir.resolve("semesters.json"), SemesterRecord.class, storageEngine, SemesterRecord::getId, SemesterRecord::setId);
        this.offeringStore = new JsonEntityStore<>(storageDir.resolve("course_offerings.json"), CourseOfferingRecord.class, storageEngine, CourseOfferingRecord::getId, CourseOfferingRecord::setId);
        this.sectionStore = new JsonEntityStore<>(storageDir.resolve("sections.json"), SectionRecord.class, storageEngine, SectionRecord::getId, SectionRecord::setId);
        this.sectionFacultyStore = new JsonEntityStore<>(storageDir.resolve("section_faculty.json"), SectionFacultyRecord.class, storageEngine, SectionFacultyRecord::getId, SectionFacultyRecord::setId);
        this.sectionStudentStore = new JsonEntityStore<>(storageDir.resolve("section_students.json"), SectionStudentRecord.class, storageEngine, SectionStudentRecord::getId, SectionStudentRecord::setId);
        this.timetableStore = new JsonEntityStore<>(storageDir.resolve("timetable_slots.json"), TimetableSlotRecord.class, storageEngine, TimetableSlotRecord::getId, TimetableSlotRecord::setId);
        this.attendanceStore = new JsonEntityStore<>(storageDir.resolve("attendance_records.json"), AttendanceRecord.class, storageEngine, AttendanceRecord::getId, AttendanceRecord::setId);
        this.registrationStore = new JsonEntityStore<>(storageDir.resolve("course_registrations.json"), CourseRegistrationRecord.class, storageEngine, CourseRegistrationRecord::getId, CourseRegistrationRecord::setId);
        this.feeHeadStore = new JsonEntityStore<>(storageDir.resolve("fee_heads.json"), FeeHeadRecord.class, storageEngine, FeeHeadRecord::getId, FeeHeadRecord::setId);
        this.feeStructureStore = new JsonEntityStore<>(storageDir.resolve("fee_structures.json"), FeeStructureRecord.class, storageEngine, FeeStructureRecord::getId, FeeStructureRecord::setId);
        this.studentFeeStore = new JsonEntityStore<>(storageDir.resolve("student_fees.json"), StudentFeeRecord.class, storageEngine, StudentFeeRecord::getId, StudentFeeRecord::setId);
        this.paymentStore = new JsonEntityStore<>(storageDir.resolve("payments.json"), PaymentRecord.class, storageEngine, PaymentRecord::getId, PaymentRecord::setId);
        this.receiptStore = new JsonEntityStore<>(storageDir.resolve("receipts.json"), ReceiptRecord.class, storageEngine, ReceiptRecord::getId, ReceiptRecord::setId);
        this.applicantStore = new JsonEntityStore<>(storageDir.resolve("applicants.json"), ApplicantRecord.class, storageEngine, ApplicantRecord::getId, ApplicantRecord::setId);
        this.applicationStore = new JsonEntityStore<>(storageDir.resolve("admission_applications.json"), AdmissionApplicationRecord.class, storageEngine, AdmissionApplicationRecord::getId, AdmissionApplicationRecord::setId);
        this.roomStore = new JsonEntityStore<>(storageDir.resolve("rooms.json"), RoomRecord.class, storageEngine, RoomRecord::getId, RoomRecord::setId);
    }

    @Override
    public void onPostInsert(PostInsertEvent event) {
        syncEntity(event.getEntity());
    }

    @Override
    public void onPostUpdate(PostUpdateEvent event) {
        syncEntity(event.getEntity());
    }

    @Override
    public void onPostDelete(PostDeleteEvent event) {
        deleteEntity(event.getEntity(), (Long) event.getId());
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return true;
    }

    private void syncEntity(Object entity) {
        try {
            if (entity instanceof Student s) {
                studentStore.save(StudentRecord.builder()
                        .id(s.getId())
                        .rollNumber(s.getRollNumber())
                        .enrollmentNumber(s.getEnrollmentNumber())
                        .firstName(s.getFirstName())
                        .lastName(s.getLastName())
                        .email(s.getEmail())
                        .phone(s.getPhone())
                        .dateOfBirth(s.getDateOfBirth())
                        .gender(s.getGender())
                        .bloodGroup(s.getBloodGroup())
                        .address(s.getAddress())
                        .city(s.getCity())
                        .state(s.getState())
                        .pincode(s.getPincode())
                        .department(s.getDepartment())
                        .program(s.getProgram())
                        .batch(s.getBatch())
                        .enrollmentDate(s.getEnrollmentDate())
                        .status(s.getStatus() != null ? s.getStatus().name() : "ACTIVE")
                        .userId(s.getUserId())
                        .createdAt(s.getCreatedAt())
                        .updatedAt(s.getUpdatedAt())
                        .build());
            } else if (entity instanceof StudentStatusHistory h) {
                Long studentId = h.getStudent() != null ? h.getStudent().getId() : null;
                historyStore.save(StudentStatusHistoryRecord.builder()
                        .id(h.getId())
                        .studentId(studentId)
                        .previousStatus(h.getPreviousStatus() != null ? h.getPreviousStatus().name() : null)
                        .newStatus(h.getNewStatus() != null ? h.getNewStatus().name() : null)
                        .reason(h.getReason())
                        .changedBy(h.getChangedBy())
                        .effectiveDate(h.getEffectiveDate())
                        .changedAt(h.getChangedAt())
                        .build());
            } else if (entity instanceof AppUser u) {
                userStore.save(UserRecord.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .passwordHash(u.getPassword())
                        .role(u.getRole() != null ? u.getRole().name() : null)
                        .enabled(u.isEnabled())
                        .createdAt(u.getCreatedAt())
                        .updatedAt(u.getUpdatedAt())
                        .build());
            } else if (entity instanceof Guardian g) {
                String fullName = ((g.getFirstName() != null ? g.getFirstName() : "") + " " + (g.getLastName() != null ? g.getLastName() : "")).trim();
                List<Long> wardIds = g.getStudent() != null ? List.of(g.getStudent().getId()) : List.of();
                guardianStore.save(GuardianRecord.builder()
                        .id(g.getId())
                        .name(fullName)
                        .email(g.getEmail())
                        .phone(g.getPhone())
                        .relationship(g.getRelation())
                        .userId(g.getUserId())
                        .wardStudentIds(wardIds)
                        .build());
            } else if (entity instanceof Faculty f) {
                facultyStore.save(FacultyRecord.builder()
                        .id(f.getId())
                        .employeeId(f.getId() != null ? "FAC-" + f.getId() : "FAC-1")
                        .firstName(f.getFirstName())
                        .lastName(f.getLastName())
                        .email(f.getOfficialEmail())
                        .phone(null)
                        .departmentId(f.getDepartmentId())
                        .designation("Faculty")
                        .userId(f.getUserId())
                        .build());
            } else if (entity instanceof Department d) {
                departmentStore.save(DepartmentRecord.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .build());
            } else if (entity instanceof AcademicYear ay) {
                academicYearStore.save(AcademicYearRecord.builder()
                        .id(ay.getId())
                        .name(ay.getName())
                        .startDate(ay.getStartDate())
                        .endDate(ay.getEndDate())
                        .isActive(ay.getIsActive())
                        .build());
            } else if (entity instanceof Program p) {
                programStore.save(ProgramRecord.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .code(p.getCode())
                        .degree(p.getDegree())
                        .departmentId(p.getDepartmentId())
                        .duration(p.getDuration())
                        .build());
            } else if (entity instanceof Course c) {
                courseStore.save(CourseRecord.builder()
                        .id(c.getId())
                        .code(c.getCode())
                        .name(c.getName())
                        .courseType(c.getCourseType())
                        .credits(c.getCredits())
                        .departmentId(c.getDepartmentId())
                        .programId(c.getProgramId())
                        .build());
            } else if (entity instanceof CoursePrerequisite cp) {
                prerequisiteStore.save(CoursePrerequisiteRecord.builder()
                        .id(cp.getId())
                        .courseId(cp.getCourse() != null ? cp.getCourse().getId() : null)
                        .prerequisiteCourseId(cp.getPrerequisiteCourse() != null ? cp.getPrerequisiteCourse().getId() : null)
                        .build());
            } else if (entity instanceof Batch b) {
                batchStore.save(BatchRecord.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .code(b.getCode())
                        .programId(b.getProgramId())
                        .academicYearId(b.getAcademicYearId())
                        .admissionYear(b.getAdmissionYear())
                        .graduationYear(b.getGraduationYear())
                        .isActive(b.getIsActive() != null ? b.getIsActive() : true)
                        .createdAt(b.getCreatedAt() != null ? b.getCreatedAt() : java.time.Instant.now())
                        .build());
            } else if (entity instanceof Semester s) {
                semesterStore.save(SemesterRecord.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .semesterNumber(s.getSemesterNumber())
                        .academicYearId(s.getAcademicYearId())
                        .startDate(s.getStartDate())
                        .endDate(s.getEndDate())
                        .isActive(s.getIsActive())
                        .build());
            } else if (entity instanceof CourseOffering co) {
                offeringStore.save(CourseOfferingRecord.builder()
                        .id(co.getId())
                        .courseId(co.getCourse() != null ? co.getCourse().getId() : null)
                        .semesterId(co.getSemester() != null ? co.getSemester().getId() : null)
                        .isPublished(co.getIsPublished())
                        .build());
            } else if (entity instanceof Section sec) {
                sectionStore.save(SectionRecord.builder()
                        .id(sec.getId())
                        .name(sec.getName())
                        .courseOfferingId(sec.getCourseOffering() != null ? sec.getCourseOffering().getId() : null)
                        .capacity(sec.getCapacity())
                        .isActive(sec.getIsActive())
                        .build());
            } else if (entity instanceof com.erp.academic.section.entity.SectionFaculty sf) {
                sectionFacultyStore.save(SectionFacultyRecord.builder()
                        .id(sf.getId())
                        .sectionId(sf.getSectionId())
                        .facultyId(sf.getFacultyId())
                        .subjectId(sf.getSubjectId())
                        .role(sf.getRole())
                        .assignedAt(sf.getAssignedAt())
                        .build());
            } else if (entity instanceof com.erp.academic.section.entity.SectionStudent ss) {
                sectionStudentStore.save(SectionStudentRecord.builder()
                        .id(ss.getId())
                        .sectionId(ss.getSectionId())
                        .studentId(ss.getStudentId())
                        .isActive(ss.getIsActive())
                        .build());
            } else if (entity instanceof TimetableSlot ts) {
                Integer dayVal = ts.getDayOfWeek() != null ? ts.getDayOfWeek().getValue() : null;
                timetableStore.save(TimetableSlotRecord.builder()
                        .id(ts.getId())
                        .sectionId(ts.getSectionId())
                        .dayOfWeek(dayVal)
                        .startTime(ts.getStartTime())
                        .endTime(ts.getEndTime())
                        .facultyId(ts.getFacultyId())
                        .room(ts.getRoomId() != null ? "Room-" + ts.getRoomId() : null)
                        .isActive(ts.getIsActive())
                        .build());
            } else if (entity instanceof StudentAttendanceRecord sar) {
                LocalDateTime recordedTime = sar.getCreatedAt() != null
                        ? LocalDateTime.ofInstant(sar.getCreatedAt(), ZoneId.systemDefault())
                        : LocalDateTime.now();
                attendanceStore.save(AttendanceRecord.builder()
                        .id(sar.getId())
                        .studentId(sar.getStudentId())
                        .scheduleId(sar.getScheduleId())
                        .attendanceDate(sar.getAttendanceDate())
                        .status(sar.getStatus())
                        .remarks(sar.getRemarks())
                        .markedByFacultyId(sar.getMarkedByFacultyId())
                        .recordedAt(recordedTime)
                        .build());
            } else if (entity instanceof CourseRegistration cr) {
                LocalDate regDate = cr.getRegisteredAt() != null
                        ? LocalDate.ofInstant(cr.getRegisteredAt(), ZoneId.systemDefault())
                        : LocalDate.now();
                registrationStore.save(CourseRegistrationRecord.builder()
                        .id(cr.getId())
                        .studentId(cr.getStudent() != null ? cr.getStudent().getId() : null)
                        .courseOfferingId(cr.getCourseOffering() != null ? cr.getCourseOffering().getId() : null)
                        .sectionId(cr.getSection() != null ? cr.getSection().getId() : null)
                        .registrationDate(regDate)
                        .status(cr.getStatus() != null ? cr.getStatus().name() : null)
                        .grade(null)
                        .build());
            } else if (entity instanceof FeeHead fh) {
                feeHeadStore.save(FeeHeadRecord.builder()
                        .id(fh.getId())
                        .name(fh.getName())
                        .code(fh.getCode())
                        .description(fh.getDescription())
                        .build());
            } else if (entity instanceof FeeStructure fs) {
                List<FeeStructureComponentItem> compItems = new java.util.ArrayList<>();
                if (fs.getComponents() != null) {
                    for (var c : fs.getComponents()) {
                        compItems.add(FeeStructureComponentItem.builder()
                                .feeHeadId(c.getFeeHead() != null ? c.getFeeHead().getId() : null)
                                .feeHeadName(c.getFeeHead() != null ? c.getFeeHead().getName() : null)
                                .amount(c.getAmount())
                                .build());
                    }
                }
                feeStructureStore.save(FeeStructureRecord.builder()
                        .id(fs.getId())
                        .name(fs.getName())
                        .academicYearId(fs.getAcademicYearId())
                        .active(fs.getActive())
                        .components(compItems)
                        .build());
            } else if (entity instanceof StudentFee sf) {
                List<StudentFeeComponentItem> compItems = new java.util.ArrayList<>();
                if (sf.getComponents() != null) {
                    for (var c : sf.getComponents()) {
                        compItems.add(StudentFeeComponentItem.builder()
                                .feeHeadId(c.getFeeHead() != null ? c.getFeeHead().getId() : null)
                                .feeHeadName(c.getFeeHead() != null ? c.getFeeHead().getName() : null)
                                .grossAmount(c.getGrossAmount())
                                .outstandingAmount(c.getOutstandingAmount())
                                .build());
                    }
                }
                studentFeeStore.save(StudentFeeRecord.builder()
                        .id(sf.getId())
                        .studentId(sf.getStudentId())
                        .academicYearId(sf.getAcademicYearId())
                        .feeStructureId(sf.getFeeStructureId())
                        .grossAmount(sf.getGrossAmount())
                        .netPayable(sf.getNetPayable())
                        .outstandingAmount(sf.getOutstandingAmount())
                        .status(sf.getStatus() != null ? sf.getStatus().name() : null)
                        .components(compItems)
                        .build());
            } else if (entity instanceof Payment p) {
                paymentStore.save(PaymentRecord.builder()
                        .id(p.getId())
                        .studentFeeId(p.getStudentFee() != null ? p.getStudentFee().getId() : null)
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null)
                        .referenceNumber(p.getReferenceNumber())
                        .status(p.getStatus() != null ? p.getStatus().name() : null)
                        .idempotencyKey(p.getIdempotencyKey())
                        .requestHash(p.getRequestHash())
                        .remarks(p.getRemarks())
                        .createdBy(p.getCreatedBy())
                        .createdAt(p.getPaymentDate() != null ? p.getPaymentDate().atStartOfDay() : LocalDateTime.now())
                        .build());
            } else if (entity instanceof Receipt r) {
                Payment pay = r.getPayment();
                receiptStore.save(ReceiptRecord.builder()
                        .id(r.getId())
                        .receiptNumber(r.getReceiptNumber())
                        .paymentId(pay != null ? pay.getId() : null)
                        .studentFeeId(pay != null && pay.getStudentFee() != null ? pay.getStudentFee().getId() : null)
                        .amount(pay != null ? pay.getAmount() : null)
                        .receiptDate(LocalDate.now())
                        .issuedBy(pay != null ? pay.getCreatedBy() : "SYSTEM")
                        .build());
            } else if (entity instanceof Applicant a) {
                applicantStore.save(ApplicantRecord.builder()
                        .id(a.getId())
                        .firstName(a.getFirstName())
                        .lastName(a.getLastName())
                        .email(a.getEmail())
                        .phone(a.getPhone())
                        .dateOfBirth(a.getDateOfBirth())
                        .gender(a.getGender())
                        .address(a.getAddress())
                        .build());
            } else if (entity instanceof AdmissionApplication aa) {
                applicationStore.save(AdmissionApplicationRecord.builder()
                        .id(aa.getId())
                        .applicationNumber(aa.getApplicationNumber())
                        .applicantId(aa.getApplicant() != null ? aa.getApplicant().getId() : null)
                        .programId(aa.getProgram() != null ? aa.getProgram().getId() : null)
                        .academicYearId(aa.getAcademicYear() != null ? aa.getAcademicYear().getId() : null)
                        .status(aa.getStatus() != null ? aa.getStatus().name() : null)
                        .meritScore(aa.getMeritScore())
                        .reviewerRemarks(aa.getReviewerRemarks())
                        .build());
            } else if (entity instanceof com.erp.academic.room.entity.Room rm) {
                roomStore.save(RoomRecord.builder()
                        .id(rm.getId())
                        .name(rm.getName())
                        .capacity(rm.getCapacity())
                        .isActive(rm.getIsActive() != null ? rm.getIsActive() : true)
                        .build());
            }
        } catch (Exception e) {
            log.error("DevJsonSyncEngine failed to sync entity {}: {}", entity.getClass().getSimpleName(), e.getMessage(), e);
        }
    }

    private void deleteEntity(Object entity, Long id) {
        if (id == null) return;
        if (entity instanceof Student) studentStore.deleteById(id);
        else if (entity instanceof AppUser) userStore.deleteById(id);
        else if (entity instanceof Guardian) guardianStore.deleteById(id);
        else if (entity instanceof Faculty) facultyStore.deleteById(id);
        else if (entity instanceof Department) departmentStore.deleteById(id);
        else if (entity instanceof AcademicYear) academicYearStore.deleteById(id);
        else if (entity instanceof Program) programStore.deleteById(id);
        else if (entity instanceof Course) courseStore.deleteById(id);
        else if (entity instanceof CoursePrerequisite) prerequisiteStore.deleteById(id);
        else if (entity instanceof Batch) batchStore.deleteById(id);
        else if (entity instanceof Semester) semesterStore.deleteById(id);
        else if (entity instanceof CourseOffering) offeringStore.deleteById(id);
        else if (entity instanceof Section) sectionStore.deleteById(id);
        else if (entity instanceof com.erp.academic.section.entity.SectionFaculty) sectionFacultyStore.deleteById(id);
        else if (entity instanceof com.erp.academic.section.entity.SectionStudent) sectionStudentStore.deleteById(id);
        else if (entity instanceof TimetableSlot) timetableStore.deleteById(id);
        else if (entity instanceof StudentAttendanceRecord) attendanceStore.deleteById(id);
        else if (entity instanceof CourseRegistration) registrationStore.deleteById(id);
        else if (entity instanceof FeeHead) feeHeadStore.deleteById(id);
        else if (entity instanceof FeeStructure) feeStructureStore.deleteById(id);
        else if (entity instanceof StudentFee) studentFeeStore.deleteById(id);
        else if (entity instanceof Payment) paymentStore.deleteById(id);
        else if (entity instanceof Receipt) receiptStore.deleteById(id);
        else if (entity instanceof Applicant) applicantStore.deleteById(id);
        else if (entity instanceof AdmissionApplication) applicationStore.deleteById(id);
        else if (entity instanceof com.erp.academic.room.entity.Room) roomStore.deleteById(id);
    }

    public Path getStorageDir() { return storageDir; }
    public JsonEntityStore<StudentRecord> getStudentStore() { return studentStore; }
    public JsonEntityStore<UserRecord> getUserStore() { return userStore; }
    public JsonEntityStore<PaymentRecord> getPaymentStore() { return paymentStore; }
    public JsonEntityStore<StudentFeeRecord> getStudentFeeStore() { return studentFeeStore; }
    public JsonEntityStore<ReceiptRecord> getReceiptStore() { return receiptStore; }
}
