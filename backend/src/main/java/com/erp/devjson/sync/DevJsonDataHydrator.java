package com.erp.devjson.sync;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.course_registration.repository.CourseRegistrationRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.entity.SectionFaculty;
import com.erp.academic.section.entity.SectionStudent;
import com.erp.academic.section.repository.SectionFacultyRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.AcademicJsonModels.*;
import com.erp.devjson.model.AdmissionJsonModels.*;
import com.erp.devjson.model.FacultyJsonModels.FacultyRecord;
import com.erp.devjson.model.GuardianJsonModels.GuardianRecord;
import com.erp.devjson.model.StudentJsonModels.*;
import com.erp.devjson.model.TimetableJsonModels.TimetableSlotRecord;
import com.erp.devjson.model.UserJsonModels.*;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.entity.StudentStatusHistory;
import com.erp.student.repository.StudentRepository;
import com.erp.student.repository.StudentStatusHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.DayOfWeek;
import java.util.List;

@Component
@Profile("dev-json")
public class DevJsonDataHydrator {

    private static final Logger log = LoggerFactory.getLogger(DevJsonDataHydrator.class);

    private final Path storageDir;
    private final JsonFileStorageEngine storageEngine = new JsonFileStorageEngine();

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentStatusHistoryRepository statusHistoryRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProgramRepository programRepository;
    private final CourseRepository courseRepository;
    private final FacultyRepository facultyRepository;
    private final GuardianRepository guardianRepository;
    private final BatchRepository batchRepository;
    private final SemesterRepository semesterRepository;
    private final CourseOfferingRepository offeringRepository;
    private final SectionRepository sectionRepository;
    private final SectionFacultyRepository sectionFacultyRepository;
    private final SectionStudentRepository sectionStudentRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final com.erp.academic.room.repository.RoomRepository roomRepository;
    private final com.erp.finance.fee_structure.repository.FeeHeadRepository feeHeadRepository;
    private final com.erp.finance.fee_structure.repository.FeeStructureRepository feeStructureRepository;
    private final com.erp.finance.student_fee.repository.StudentFeeRepository studentFeeRepository;
    private final com.erp.finance.payment.repository.PaymentRepository paymentRepository;
    private final com.erp.finance.invoice.repository.ReceiptRepository receiptRepository;
    private final com.erp.attendance.repository.StudentAttendanceRecordRepository attendanceRecordRepository;
    @Autowired(required = false)
    private CourseRegistrationRepository courseRegistrationRepository;
    @Autowired(required = false)
    private com.erp.institution.repository.InstitutionRepository institutionRepository;
    @Autowired(required = false)
    private com.erp.campus.repository.CampusRepository campusRepository;
    @Autowired(required = false)
    private com.erp.admission.applicant.repository.ApplicantRepository applicantRepository;
    @Autowired(required = false)
    private com.erp.admission.application.repository.AdmissionApplicationRepository admissionApplicationRepository;
    @Autowired(required = false)
    private com.erp.admission.document.repository.ApplicantDocumentRepository applicantDocumentRepository;
    @Autowired(required = false)
    private com.erp.student.repository.StudentDocumentRepository studentDocumentRepository;

    @Autowired
    public DevJsonDataHydrator(
            DevJsonProperties properties,
            UserRepository userRepository,
            StudentRepository studentRepository,
            StudentStatusHistoryRepository statusHistoryRepository,
            DepartmentRepository departmentRepository,
            AcademicYearRepository academicYearRepository,
            ProgramRepository programRepository,
            CourseRepository courseRepository,
            FacultyRepository facultyRepository,
            GuardianRepository guardianRepository,
            BatchRepository batchRepository,
            SemesterRepository semesterRepository,
            CourseOfferingRepository offeringRepository,
            SectionRepository sectionRepository,
            SectionFacultyRepository sectionFacultyRepository,
            SectionStudentRepository sectionStudentRepository,
            TimetableSlotRepository timetableSlotRepository,
            @Autowired(required = false) com.erp.academic.room.repository.RoomRepository roomRepository,
            com.erp.finance.fee_structure.repository.FeeHeadRepository feeHeadRepository,
            com.erp.finance.fee_structure.repository.FeeStructureRepository feeStructureRepository,
            com.erp.finance.student_fee.repository.StudentFeeRepository studentFeeRepository,
            com.erp.finance.payment.repository.PaymentRepository paymentRepository,
            com.erp.finance.invoice.repository.ReceiptRepository receiptRepository,
            @Autowired(required = false) com.erp.attendance.repository.StudentAttendanceRecordRepository attendanceRecordRepository) {
        this.storageDir = properties.getStoragePath();
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.departmentRepository = departmentRepository;
        this.academicYearRepository = academicYearRepository;
        this.programRepository = programRepository;
        this.courseRepository = courseRepository;
        this.facultyRepository = facultyRepository;
        this.guardianRepository = guardianRepository;
        this.batchRepository = batchRepository;
        this.semesterRepository = semesterRepository;
        this.offeringRepository = offeringRepository;
        this.sectionRepository = sectionRepository;
        this.sectionFacultyRepository = sectionFacultyRepository;
        this.sectionStudentRepository = sectionStudentRepository;
        this.timetableSlotRepository = timetableSlotRepository;
        this.roomRepository = roomRepository;
        this.feeHeadRepository = feeHeadRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.studentFeeRepository = studentFeeRepository;
        this.paymentRepository = paymentRepository;
        this.receiptRepository = receiptRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void hydrateOnStartup() {
        if (!Files.exists(storageDir)) {
            try {
                Files.createDirectories(storageDir);
                log.info("Created missing dev-json storage directory at {}", storageDir);
            } catch (Exception e) {
                log.error("CRITICAL: Configured dev-json storage directory {} does not exist and cannot be created: {}", storageDir, e.getMessage());
                throw new IllegalStateException("Configured dev-json storage directory cannot be initialized: " + storageDir, e);
            }
        }

        if (!Files.isDirectory(storageDir)) {
            log.error("CRITICAL: Configured dev-json storage path {} is not a directory.", storageDir);
            throw new IllegalStateException("Configured dev-json storage path is not a directory: " + storageDir);
        }

        if (!Files.isWritable(storageDir)) {
            log.error("CRITICAL: Configured dev-json storage directory {} is not writable.", storageDir);
            throw new IllegalStateException("Configured dev-json storage directory is not writable: " + storageDir);
        }

        try {
            // 1. Hydrate Users
            Path usersFile = storageDir.resolve("users.json");
            if (Files.exists(usersFile)) {
                List<UserRecord> userRecords = storageEngine.readList(usersFile, UserRecord.class);
                for (UserRecord u : userRecords) {
                    if (!userRepository.existsByUsernameIgnoreCase(u.getUsername()) 
                            && (u.getEmail() == null || !userRepository.existsByEmailIgnoreCase(u.getEmail()))) {
                        Role r = u.getRole() != null ? Role.valueOf(u.getRole()) : Role.STUDENT;
                        AppUser user = new AppUser(u.getUsername(), u.getPasswordHash(), u.getEmail(), r, Boolean.TRUE.equals(u.getEnabled()));
                        userRepository.save(user);
                    }
                }
            }

            // 2. Hydrate Departments
            Path deptFile = storageDir.resolve("departments.json");
            if (Files.exists(deptFile)) {
                List<DepartmentRecord> deptRecords = storageEngine.readList(deptFile, DepartmentRecord.class);
                for (DepartmentRecord d : deptRecords) {
                    boolean exists = departmentRepository.findAll().stream()
                            .anyMatch(dept -> dept.getCode().equalsIgnoreCase(d.getCode()));
                    if (!exists) {
                        Department dept = new Department();
                        dept.setName(d.getName());
                        dept.setCode(d.getCode());
                        departmentRepository.save(dept);
                    }
                }
            }

            // 3. Hydrate Academic Years
            Path ayFile = storageDir.resolve("academic_years.json");
            if (Files.exists(ayFile)) {
                List<AcademicYearRecord> ayRecords = storageEngine.readList(ayFile, AcademicYearRecord.class);
                for (AcademicYearRecord ay : ayRecords) {
                    boolean exists = academicYearRepository.findAll().stream()
                            .anyMatch(year -> year.getName().equalsIgnoreCase(ay.getName()));
                    if (!exists) {
                        AcademicYear ayEntity = new AcademicYear();
                        ayEntity.setName(ay.getName());
                        ayEntity.setStartDate(ay.getStartDate());
                        ayEntity.setEndDate(ay.getEndDate());
                        ayEntity.setIsActive(ay.getIsActive() != null ? ay.getIsActive() : true);
                        academicYearRepository.save(ayEntity);
                    }
                }
            }

            // 4. Hydrate Programs
            Path progFile = storageDir.resolve("programs.json");
            if (Files.exists(progFile)) {
                List<ProgramRecord> progRecords = storageEngine.readList(progFile, ProgramRecord.class);
                for (ProgramRecord p : progRecords) {
                    if (programRepository.findByCode(p.getCode()).isEmpty()) {
                        Program pEntity = new Program();
                        pEntity.setName(p.getName());
                        pEntity.setCode(p.getCode());
                        pEntity.setDegree(p.getDegree());
                        pEntity.setDepartmentId(p.getDepartmentId());
                        pEntity.setDuration(p.getDuration());
                        pEntity.setIsActive(true);
                        programRepository.save(pEntity);
                    }
                }
            }

            // 5. Hydrate Courses
            Path courseFile = storageDir.resolve("courses.json");
            if (Files.exists(courseFile)) {
                List<CourseRecord> courseRecords = storageEngine.readList(courseFile, CourseRecord.class);
                for (CourseRecord c : courseRecords) {
                    if (courseRepository.findByCode(c.getCode()).isEmpty()) {
                        Course cEntity = new Course();
                        cEntity.setCode(c.getCode());
                        cEntity.setName(c.getName());
                        cEntity.setCourseType(c.getCourseType());
                        cEntity.setCredits(c.getCredits());
                        cEntity.setDepartmentId(c.getDepartmentId());
                        cEntity.setProgramId(c.getProgramId());
                        cEntity.setIsActive(true);
                        courseRepository.save(cEntity);
                    }
                }
            }

            // 6. Hydrate Faculty
            Path facultyFile = storageDir.resolve("faculty.json");
            if (Files.exists(facultyFile)) {
                List<FacultyRecord> facultyRecords = storageEngine.readList(facultyFile, FacultyRecord.class);
                for (FacultyRecord f : facultyRecords) {
                    if (!facultyRepository.existsByOfficialEmailIgnoreCase(f.getEmail())) {
                        Long resolvedUserId = null;
                        if (f.getUserId() != null && userRepository.existsById(f.getUserId())) {
                            resolvedUserId = f.getUserId();
                        } else if (f.getEmail() != null) {
                            resolvedUserId = userRepository.findByEmailIgnoreCase(f.getEmail()).map(AppUser::getId).orElse(null);
                        }

                        Faculty faculty = Faculty.builder()
                                .firstName(f.getFirstName())
                                .lastName(f.getLastName())
                                .officialEmail(f.getEmail())
                                .departmentId(f.getDepartmentId())
                                .userId(resolvedUserId)
                                .isActive(true)
                                .build();
                        if (resolvedUserId != null && facultyRepository.findByUserId(resolvedUserId).isPresent()) {
                            faculty.setUserId(null);
                        }
                        facultyRepository.save(faculty);
                    }
                }
            }

            // 7. Hydrate Students
            Path studentFile = storageDir.resolve("students.json");
            if (Files.exists(studentFile)) {
                List<StudentRecord> studentRecords = storageEngine.readList(studentFile, StudentRecord.class);
                boolean needsFileRewrite = false;
                for (StudentRecord s : studentRecords) {
                    int year = s.getEnrollmentDate() != null ? s.getEnrollmentDate().getYear() : 2026;
                    String enrNum = s.getEnrollmentNumber();
                    if (enrNum == null || enrNum.isBlank()) {
                        enrNum = String.format("ENR-%d-%05d", year, s.getId() != null ? s.getId() : 1);
                        s.setEnrollmentNumber(enrNum);
                        needsFileRewrite = true;
                    }

                    if (!studentRepository.existsByRollNumber(s.getRollNumber())) {
                        Student student = new Student(
                                s.getRollNumber(),
                                s.getFirstName(),
                                s.getLastName(),
                                s.getEmail(),
                                s.getPhone(),
                                s.getDateOfBirth(),
                                s.getGender(),
                                s.getDepartment(),
                                s.getBatch(),
                                s.getEnrollmentDate()
                        );
                        student.setEnrollmentNumber(enrNum);
                        if (s.getBloodGroup() != null) student.setBloodGroup(s.getBloodGroup());
                        if (s.getAddress() != null) student.setAddress(s.getAddress());
                        if (s.getCity() != null) student.setCity(s.getCity());
                        if (s.getState() != null) student.setState(s.getState());
                        if (s.getPincode() != null) student.setPincode(s.getPincode());
                        if (s.getProgram() != null) student.setProgram(s.getProgram());
                        if (s.getStatus() != null) {
                            try {
                                student.setStatus(StudentStatus.valueOf(s.getStatus()));
                            } catch (Exception ignored) {}
                        }
                        Long resolvedUserId = null;
                        if (s.getUserId() != null && userRepository.existsById(s.getUserId())) {
                            resolvedUserId = s.getUserId();
                        } else if (s.getEmail() != null) {
                            resolvedUserId = userRepository.findByEmailIgnoreCase(s.getEmail()).map(AppUser::getId).orElse(null);
                        }
                        if (resolvedUserId != null && studentRepository.findByUserId(resolvedUserId).isPresent()) {
                            resolvedUserId = null;
                        }
                        student.setUserId(resolvedUserId);
                        studentRepository.save(student);
                    } else {
                        final String finalEnr = enrNum;
                        studentRepository.findByRollNumber(s.getRollNumber()).ifPresent(existing -> {
                            boolean changed = false;
                            if (existing.getEnrollmentNumber() == null || existing.getEnrollmentNumber().isBlank()) {
                                existing.setEnrollmentNumber(finalEnr);
                                changed = true;
                            }
                            if (s.getBloodGroup() != null && !s.getBloodGroup().equals(existing.getBloodGroup())) {
                                existing.setBloodGroup(s.getBloodGroup());
                                changed = true;
                            }
                            if (s.getAddress() != null && !s.getAddress().equals(existing.getAddress())) {
                                existing.setAddress(s.getAddress());
                                changed = true;
                            }
                            if (s.getCity() != null && !s.getCity().equals(existing.getCity())) {
                                existing.setCity(s.getCity());
                                changed = true;
                            }
                            if (s.getState() != null && !s.getState().equals(existing.getState())) {
                                existing.setState(s.getState());
                                changed = true;
                            }
                            if (s.getPincode() != null && !s.getPincode().equals(existing.getPincode())) {
                                existing.setPincode(s.getPincode());
                                changed = true;
                            }
                            if (s.getProgram() != null && !s.getProgram().equals(existing.getProgram())) {
                                existing.setProgram(s.getProgram());
                                changed = true;
                            }
                            if (s.getFirstName() != null && !s.getFirstName().equals(existing.getFirstName())) {
                                existing.setFirstName(s.getFirstName());
                                changed = true;
                            }
                            if (s.getLastName() != null && !s.getLastName().equals(existing.getLastName())) {
                                existing.setLastName(s.getLastName());
                                changed = true;
                            }
                            if (s.getPhone() != null && !s.getPhone().equals(existing.getPhone())) {
                                existing.setPhone(s.getPhone());
                                changed = true;
                            }
                            if (changed) {
                                studentRepository.save(existing);
                            }
                        });
                    }
                }
                if (needsFileRewrite) {
                    storageEngine.writeListAtomically(studentFile, studentRecords);
                }
            }

            // 8. Hydrate Student Status History
            Path historyFile = storageDir.resolve("student_status_history.json");
            if (Files.exists(historyFile)) {
                List<StudentStatusHistoryRecord> historyRecords = storageEngine.readList(historyFile, StudentStatusHistoryRecord.class);
                for (StudentStatusHistoryRecord h : historyRecords) {
                    Student student = studentRepository.findById(h.getStudentId()).orElse(null);
                    if (student != null) {
                        StudentStatus prevStatus = h.getPreviousStatus() != null ? StudentStatus.valueOf(h.getPreviousStatus()) : null;
                        StudentStatus newStatus = h.getNewStatus() != null ? StudentStatus.valueOf(h.getNewStatus()) : null;
                        StudentStatusHistory entity = new StudentStatusHistory(
                                student, prevStatus, newStatus, h.getReason(), h.getChangedBy(), h.getEffectiveDate()
                        );
                        statusHistoryRepository.save(entity);
                    }
                }
            }

            // 9. Hydrate Guardians
            Path guardianFile = storageDir.resolve("guardians.json");
            if (Files.exists(guardianFile)) {
                List<GuardianRecord> guardianRecords = storageEngine.readList(guardianFile, GuardianRecord.class);
                for (GuardianRecord g : guardianRecords) {
                    if (g.getWardStudentIds() != null) {
                        for (Long studentId : g.getWardStudentIds()) {
                            Student student = studentRepository.findById(studentId).orElse(null);
                            if (student != null) {
                                String name = g.getName() != null ? g.getName() : "Guardian";
                                String[] parts = name.split(" ", 2);
                                String first = parts[0];
                                String last = parts.length > 1 ? parts[1] : "Guardian";
                                String rel = g.getRelationship() != null ? g.getRelationship() : "OTHER";
                                Guardian guardian = new Guardian();
                                guardian.setStudent(student);
                                guardian.setFirstName(first);
                                guardian.setLastName(last);
                                guardian.setRelation(rel);
                                guardian.setPhone(g.getPhone() != null ? g.getPhone() : "+15550000000");
                                guardian.setEmail(g.getEmail());
                                Long resolvedUserId = null;
                                if (g.getUserId() != null && userRepository.existsById(g.getUserId())) {
                                    resolvedUserId = g.getUserId();
                                } else if (g.getEmail() != null) {
                                    resolvedUserId = userRepository.findByEmailIgnoreCase(g.getEmail()).map(AppUser::getId).orElse(null);
                                }
                                guardian.setUserId(resolvedUserId);
                                guardianRepository.save(guardian);
                            }
                        }
                    }
                }
            }

            // 10. Hydrate Batches & Semesters
            Path batchFile = storageDir.resolve("batches.json");
            if (Files.exists(batchFile)) {
                List<BatchRecord> batchRecords = storageEngine.readList(batchFile, BatchRecord.class);
                for (BatchRecord b : batchRecords) {
                    if (b.getId() != null && batchRepository.findById(b.getId()).isEmpty()) {
                        Batch batch = new Batch();
                        batch.setName(b.getName());
                        String batchCode = b.getCode();
                        if (batchCode == null || batchCode.isBlank()) {
                            batchCode = "BATCH-" + (b.getAdmissionYear() != null ? b.getAdmissionYear() : 2026) + "-" + String.format("%02d", b.getId());
                        }
                        batch.setCode(batchCode);
                        batch.setProgramId(b.getProgramId());
                        batch.setAdmissionYear(b.getAdmissionYear());
                        batch.setGraduationYear(b.getGraduationYear());
                        batch.setAcademicYearId(b.getAcademicYearId());
                        batch.setIsActive(b.getIsActive() != null ? b.getIsActive() : true);
                        batchRepository.save(batch);
                    }
                }
            }

            Path semFile = storageDir.resolve("semesters.json");
            if (Files.exists(semFile)) {
                List<SemesterRecord> semRecords = storageEngine.readList(semFile, SemesterRecord.class);
                for (SemesterRecord sem : semRecords) {
                    if (sem.getId() != null && semesterRepository.findById(sem.getId()).isEmpty()) {
                        Semester s = new Semester();
                        s.setName(sem.getName());
                        s.setSemesterNumber(sem.getSemesterNumber());
                        s.setAcademicYearId(sem.getAcademicYearId());
                        s.setStartDate(sem.getStartDate());
                        s.setEndDate(sem.getEndDate());
                        s.setIsActive(true);
                        semesterRepository.save(s);
                    }
                }
            }

            // 11. Hydrate Course Offerings & Sections
            Path offFile = storageDir.resolve("course_offerings.json");
            if (Files.exists(offFile)) {
                List<CourseOfferingRecord> offRecords = storageEngine.readList(offFile, CourseOfferingRecord.class);
                for (CourseOfferingRecord off : offRecords) {
                    if (off.getId() != null && offeringRepository.findById(off.getId()).isEmpty()) {
                        Course c = off.getCourseId() != null ? courseRepository.findById(off.getCourseId()).orElse(null) : null;
                        Semester s = off.getSemesterId() != null ? semesterRepository.findById(off.getSemesterId()).orElse(null) : null;
                        if (c != null && s != null) {
                            CourseOffering co = CourseOffering.builder()
                                    .course(c)
                                    .semester(s)
                                    .maxCapacity(off.getMaxCapacity() != null ? off.getMaxCapacity() : 60)
                                    .isPublished(Boolean.TRUE.equals(off.getIsPublished()))
                                    .build();
                            offeringRepository.save(co);
                        }
                    }
                }
            }

            Path secFile = storageDir.resolve("sections.json");
            if (Files.exists(secFile)) {
                List<SectionRecord> secRecords = storageEngine.readList(secFile, SectionRecord.class);
                for (SectionRecord sec : secRecords) {
                    if (sec.getId() != null && sectionRepository.findById(sec.getId()).isEmpty()) {
                        CourseOffering co = sec.getCourseOfferingId() != null ? offeringRepository.findById(sec.getCourseOfferingId()).orElse(null) : null;
                        Section s = Section.builder()
                                .name(sec.getName())
                                .courseOffering(co)
                                .capacity(sec.getCapacity())
                                .isActive(Boolean.TRUE.equals(sec.getIsActive()))
                                .build();
                        sectionRepository.save(s);
                    }
                }
            }

            // 12. Hydrate Section Faculty & Section Students
            Path secFacFile = storageDir.resolve("section_faculty.json");
            if (Files.exists(secFacFile)) {
                List<SectionFacultyRecord> secFacRecords = storageEngine.readList(secFacFile, SectionFacultyRecord.class);
                for (SectionFacultyRecord sf : secFacRecords) {
                    if (!sectionFacultyRepository.existsBySectionIdAndFacultyId(sf.getSectionId(), sf.getFacultyId())) {
                        SectionFaculty sfEntity = SectionFaculty.builder()
                                .sectionId(sf.getSectionId())
                                .facultyId(sf.getFacultyId())
                                .subjectId(sf.getSubjectId())
                                .role(sf.getRole())
                                .assignedAt(sf.getAssignedAt())
                                .build();
                        sectionFacultyRepository.save(sfEntity);
                    }
                }
            }

            Path secStuFile = storageDir.resolve("section_students.json");
            if (Files.exists(secStuFile)) {
                List<com.erp.devjson.model.RegistrationJsonModels.SectionStudentRecord> secStuRecords = storageEngine.readList(secStuFile, com.erp.devjson.model.RegistrationJsonModels.SectionStudentRecord.class);
                for (com.erp.devjson.model.RegistrationJsonModels.SectionStudentRecord ss : secStuRecords) {
                    if (!sectionStudentRepository.existsBySectionIdAndStudentId(ss.getSectionId(), ss.getStudentId())) {
                        SectionStudent ssEntity = SectionStudent.builder()
                                .sectionId(ss.getSectionId())
                                .studentId(ss.getStudentId())
                                .isActive(Boolean.TRUE.equals(ss.getIsActive()))
                                .build();
                        sectionStudentRepository.save(ssEntity);
                    }
                }
            }

            // 12.3 Hydrate Course Registrations
            if (courseRegistrationRepository != null) {
                Path crFile = storageDir.resolve("course_registrations.json");
                if (Files.exists(crFile)) {
                    List<com.erp.devjson.model.RegistrationJsonModels.CourseRegistrationRecord> crRecords =
                            storageEngine.readList(crFile, com.erp.devjson.model.RegistrationJsonModels.CourseRegistrationRecord.class);
                    for (var cr : crRecords) {
                        if (cr.getStudentId() != null && cr.getCourseOfferingId() != null) {
                            if (!courseRegistrationRepository.existsByStudentIdAndCourseOfferingId(cr.getStudentId(), cr.getCourseOfferingId())) {
                                var studentOpt = studentRepository.findById(cr.getStudentId());
                                var offeringOpt = offeringRepository.findById(cr.getCourseOfferingId());
                                if (studentOpt.isPresent() && offeringOpt.isPresent()) {
                                    Section sec = null;
                                    if (cr.getSectionId() != null) {
                                        sec = sectionRepository.findById(cr.getSectionId()).orElse(null);
                                    }
                                    com.erp.academic.course_registration.entity.RegistrationStatus regStatus =
                                            "DROPPED".equalsIgnoreCase(cr.getStatus()) 
                                                    ? com.erp.academic.course_registration.entity.RegistrationStatus.DROPPED 
                                                    : com.erp.academic.course_registration.entity.RegistrationStatus.REGISTERED;

                                    var reg = CourseRegistration.builder()
                                            .id(cr.getId())
                                            .student(studentOpt.get())
                                            .courseOffering(offeringOpt.get())
                                            .section(sec)
                                            .status(regStatus)
                                            .build();
                                    courseRegistrationRepository.save(reg);
                                }
                            }
                        }
                    }
                }
            }

            // 12.5 Hydrate Rooms
            if (roomRepository != null) {
                Path roomsFile = storageDir.resolve("rooms.json");
                if (Files.exists(roomsFile)) {
                    List<RoomRecord> roomRecords = storageEngine.readList(roomsFile, RoomRecord.class);
                    for (RoomRecord rr : roomRecords) {
                        if (rr.getId() != null && roomRepository.findById(rr.getId()).isEmpty()) {
                            com.erp.academic.room.entity.Room rm = com.erp.academic.room.entity.Room.builder()
                                    .id(rr.getId())
                                    .name(rr.getName())
                                    .capacity(rr.getCapacity())
                                    .isActive(rr.getIsActive() != null ? rr.getIsActive() : true)
                                    .build();
                            roomRepository.save(rm);
                        }
                    }
                }
                if (roomRepository.count() == 0) {
                    roomRepository.save(com.erp.academic.room.entity.Room.builder().name("Room 101").capacity(60).isActive(true).build());
                    roomRepository.save(com.erp.academic.room.entity.Room.builder().name("Room 102").capacity(40).isActive(true).build());
                    roomRepository.save(com.erp.academic.room.entity.Room.builder().name("Room 201").capacity(100).isActive(true).build());
                }
            }

            // 13. Hydrate Timetable Slots
            Path tsFile = storageDir.resolve("timetable_slots.json");
            if (Files.exists(tsFile)) {
                List<TimetableSlotRecord> tsRecords = storageEngine.readList(tsFile, TimetableSlotRecord.class);
                for (TimetableSlotRecord ts : tsRecords) {
                    if (ts.getId() != null && timetableSlotRepository.findById(ts.getId()).isEmpty()) {
                        DayOfWeek dow = ts.getDayOfWeek() != null ? DayOfWeek.of(ts.getDayOfWeek()) : DayOfWeek.MONDAY;
                        Long roomId = 1L;
                        if (ts.getRoom() != null) {
                            String rName = ts.getRoom().replace("Room-", "Room ");
                            var foundRm = roomRepository.findByNameIgnoreCase(rName);
                            if (foundRm.isPresent()) {
                                roomId = foundRm.get().getId();
                            } else if (roomRepository.count() > 0) {
                                roomId = roomRepository.findAll().get(0).getId();
                            }
                        }
                        TimetableSlot slot = TimetableSlot.builder()
                                .sectionId(ts.getSectionId())
                                .facultyId(ts.getFacultyId())
                                .roomId(roomId)
                                .dayOfWeek(dow)
                                .startTime(ts.getStartTime())
                                .endTime(ts.getEndTime())
                                .isActive(Boolean.TRUE.equals(ts.getIsActive()))
                                .build();
                        timetableSlotRepository.save(slot);
                    }
                }
            }

            // Hydrate Attendance Records
            Path attFile = storageDir.resolve("attendance_records.json");
            if (Files.exists(attFile) && attendanceRecordRepository != null) {
                List<com.erp.devjson.model.AttendanceJsonModels.AttendanceRecord> attRecords = 
                        storageEngine.readList(attFile, com.erp.devjson.model.AttendanceJsonModels.AttendanceRecord.class);
                for (com.erp.devjson.model.AttendanceJsonModels.AttendanceRecord ar : attRecords) {
                    if (ar.getId() != null && attendanceRecordRepository.findById(ar.getId()).isEmpty()) {
                        com.erp.attendance.entity.StudentAttendanceRecord entity = com.erp.attendance.entity.StudentAttendanceRecord.builder()
                                .id(ar.getId())
                                .studentId(ar.getStudentId())
                                .scheduleId(ar.getScheduleId())
                                .attendanceDate(ar.getAttendanceDate())
                                .status(ar.getStatus())
                                .remarks(ar.getRemarks())
                                .markedByFacultyId(ar.getMarkedByFacultyId())
                                .build();
                        attendanceRecordRepository.save(entity);
                    }
                }
            }

            // 14. Link default development test users to fixtures if needed
            userRepository.findByUsernameIgnoreCase("student").ifPresent(stuUser -> {
                if (studentRepository.findByUserId(stuUser.getId()).isEmpty()) {
                    studentRepository.findById(1L).ifPresent(s1 -> {
                        if (s1.getUserId() == null) {
                            s1.setUserId(stuUser.getId());
                            try {
                                studentRepository.save(s1);
                            } catch (Exception ignored) {}
                        }
                    });
                }
            });
            userRepository.findByUsernameIgnoreCase("parent").ifPresent(parentUser -> {
                studentRepository.findById(1L).ifPresent(s1 -> {
                    List<Guardian> existingGuardians = guardianRepository.findByEmail("parent@erp.com");
                    if (existingGuardians.isEmpty()) {
                        Guardian g = new Guardian("Parent", "Sharma", "MOTHER", "+919811223366", "parent@erp.com");
                        g.setOccupation("Architect");
                        g.setAddress("Flat 402, Sunshine Heights, New Delhi");
                        g.setIsEmergencyContact(false);
                        g.setStudent(s1);
                        g.setUserId(parentUser.getId());
                        guardianRepository.save(g);
                    } else {
                        for (Guardian g : existingGuardians) {
                            if (g.getUserId() == null) {
                                g.setUserId(parentUser.getId());
                                guardianRepository.save(g);
                            }
                        }
                    }
                });
            });

            // 15. Hydrate Finance: Fee Heads, Structures, Fees, Payments, Receipts
            Path feeHeadFile = storageDir.resolve("fee_heads.json");
            if (Files.exists(feeHeadFile)) {
                List<com.erp.devjson.model.FinanceJsonModels.FeeHeadRecord> feeHeadRecords = 
                        storageEngine.readList(feeHeadFile, com.erp.devjson.model.FinanceJsonModels.FeeHeadRecord.class);
                for (com.erp.devjson.model.FinanceJsonModels.FeeHeadRecord fh : feeHeadRecords) {
                    if (fh.getCode() != null && feeHeadRepository.findByCode(fh.getCode()).isEmpty()) {
                        com.erp.finance.fee_structure.entity.FeeHead head = new com.erp.finance.fee_structure.entity.FeeHead();
                        head.setName(fh.getName());
                        head.setCode(fh.getCode());
                        head.setDescription(fh.getDescription());
                        head.setActive(true);
                        feeHeadRepository.save(head);
                    }
                }
            }
            if (feeHeadRepository.count() == 0) {
                com.erp.finance.fee_structure.entity.FeeHead fh1 = new com.erp.finance.fee_structure.entity.FeeHead();
                fh1.setCode("LAB_FEE");
                fh1.setName("Laboratory Fee");
                fh1.setDescription("Laboratory Fee");
                feeHeadRepository.save(fh1);

                com.erp.finance.fee_structure.entity.FeeHead fh2 = new com.erp.finance.fee_structure.entity.FeeHead();
                fh2.setCode("TUITION_FEE");
                fh2.setName("Tuition Fee");
                fh2.setDescription("Tuition Fee");
                feeHeadRepository.save(fh2);
            }

            Path feeStructFile = storageDir.resolve("fee_structures.json");
            if (Files.exists(feeStructFile)) {
                List<com.erp.devjson.model.FinanceJsonModels.FeeStructureRecord> structRecords = 
                        storageEngine.readList(feeStructFile, com.erp.devjson.model.FinanceJsonModels.FeeStructureRecord.class);
                for (com.erp.devjson.model.FinanceJsonModels.FeeStructureRecord fsr : structRecords) {
                    if (fsr.getId() != null && feeStructureRepository.findById(fsr.getId()).isEmpty()) {
                        com.erp.finance.fee_structure.entity.FeeStructure fs = new com.erp.finance.fee_structure.entity.FeeStructure();
                        fs.setName(fsr.getName());
                        fs.setCode("FS-" + fsr.getId());
                        fs.setAcademicYearId(fsr.getAcademicYearId());
                        fs.setActive(Boolean.TRUE.equals(fsr.getActive()));
                        if (fsr.getComponents() != null) {
                            for (com.erp.devjson.model.FinanceJsonModels.FeeStructureComponentItem item : fsr.getComponents()) {
                                if (item.getFeeHeadId() != null) {
                                    feeHeadRepository.findById(item.getFeeHeadId()).ifPresent(head -> {
                                        com.erp.finance.fee_structure.entity.FeeStructureComponent comp = new com.erp.finance.fee_structure.entity.FeeStructureComponent();
                                        comp.setFeeStructure(fs);
                                        comp.setFeeHead(head);
                                        comp.setAmount(item.getAmount() != null ? item.getAmount() : java.math.BigDecimal.ZERO);
                                        fs.getComponents().add(comp);
                                    });
                                }
                            }
                        }
                        feeStructureRepository.save(fs);
                    }
                }
            }

            Path studentFeeFile = storageDir.resolve("student_fees.json");
            if (Files.exists(studentFeeFile)) {
                List<com.erp.devjson.model.FinanceJsonModels.StudentFeeRecord> sfRecords = 
                        storageEngine.readList(studentFeeFile, com.erp.devjson.model.FinanceJsonModels.StudentFeeRecord.class);
                for (com.erp.devjson.model.FinanceJsonModels.StudentFeeRecord sfr : sfRecords) {
                    if (sfr.getId() != null && studentFeeRepository.findById(sfr.getId()).isEmpty()) {
                        com.erp.finance.student_fee.entity.StudentFee sf = new com.erp.finance.student_fee.entity.StudentFee();
                        sf.setStudentId(sfr.getStudentId());
                        sf.setAcademicYearId(sfr.getAcademicYearId());
                        sf.setFeeStructureId(sfr.getFeeStructureId());
                        sf.setGrossAmount(sfr.getGrossAmount() != null ? sfr.getGrossAmount() : java.math.BigDecimal.ZERO);
                        sf.setNetPayable(sfr.getNetPayable() != null ? sfr.getNetPayable() : java.math.BigDecimal.ZERO);
                        sf.setOutstandingAmount(sfr.getOutstandingAmount() != null ? sfr.getOutstandingAmount() : java.math.BigDecimal.ZERO);
                        java.math.BigDecimal paid = sf.getNetPayable().subtract(sf.getOutstandingAmount());
                        sf.setPaidAmount(paid.compareTo(java.math.BigDecimal.ZERO) >= 0 ? paid : java.math.BigDecimal.ZERO);
                        if (sfr.getStatus() != null) {
                            try {
                                sf.setStatus(com.erp.finance.enums.StudentFeeStatus.valueOf(sfr.getStatus()));
                            } catch (Exception ignored) {
                                sf.setStatus(com.erp.finance.enums.StudentFeeStatus.PENDING);
                            }
                        }
                        studentFeeRepository.save(sf);
                    }
                }
            }

            Path paymentFile = storageDir.resolve("payments.json");
            if (Files.exists(paymentFile)) {
                List<com.erp.devjson.model.FinanceJsonModels.PaymentRecord> payRecords = 
                        storageEngine.readList(paymentFile, com.erp.devjson.model.FinanceJsonModels.PaymentRecord.class);
                for (com.erp.devjson.model.FinanceJsonModels.PaymentRecord pr : payRecords) {
                    if (pr.getReferenceNumber() != null && paymentRepository.findByReferenceNumber(pr.getReferenceNumber()).isEmpty()) {
                        com.erp.finance.student_fee.entity.StudentFee sf = pr.getStudentFeeId() != null 
                                ? studentFeeRepository.findById(pr.getStudentFeeId()).orElse(null) : null;
                        if (sf != null) {
                            com.erp.finance.payment.entity.Payment pay = new com.erp.finance.payment.entity.Payment();
                            pay.setReferenceNumber(pr.getReferenceNumber());
                            pay.setStudentId(sf.getStudentId());
                            pay.setStudentFee(sf);
                            pay.setAmount(pr.getAmount() != null ? pr.getAmount() : java.math.BigDecimal.ZERO);
                            pay.setPaymentDate(pr.getPaymentDate() != null ? pr.getPaymentDate() : java.time.LocalDate.now());
                            if (pr.getPaymentMethod() != null) {
                                try {
                                    pay.setPaymentMethod(com.erp.finance.enums.PaymentMethod.valueOf(pr.getPaymentMethod()));
                                } catch (Exception ignored) {
                                    pay.setPaymentMethod(com.erp.finance.enums.PaymentMethod.CASH);
                                }
                            } else {
                                pay.setPaymentMethod(com.erp.finance.enums.PaymentMethod.CASH);
                            }
                            if (pr.getStatus() != null) {
                                try {
                                    pay.setStatus(com.erp.finance.enums.PaymentStatus.valueOf(pr.getStatus()));
                                } catch (Exception ignored) {
                                    pay.setStatus(com.erp.finance.enums.PaymentStatus.SUCCESS);
                                }
                            } else {
                                pay.setStatus(com.erp.finance.enums.PaymentStatus.SUCCESS);
                            }
                            pay.setIdempotencyKey(pr.getIdempotencyKey());
                            pay.setRequestHash(pr.getRequestHash());
                            pay.setRemarks(pr.getRemarks());
                            pay.setCreatedBy(pr.getCreatedBy() != null ? pr.getCreatedBy() : "superadmin");
                            paymentRepository.save(pay);
                        }
                    }
                }
            }

            Path receiptFile = storageDir.resolve("receipts.json");
            if (Files.exists(receiptFile)) {
                List<com.erp.devjson.model.FinanceJsonModels.ReceiptRecord> rcRecords = 
                        storageEngine.readList(receiptFile, com.erp.devjson.model.FinanceJsonModels.ReceiptRecord.class);
                for (com.erp.devjson.model.FinanceJsonModels.ReceiptRecord rr : rcRecords) {
                    if (rr.getReceiptNumber() != null && receiptRepository.findByReceiptNumber(rr.getReceiptNumber()).isEmpty()) {
                        com.erp.finance.payment.entity.Payment pay = rr.getPaymentId() != null 
                                ? paymentRepository.findById(rr.getPaymentId()).orElse(null) : null;
                        if (pay != null) {
                            com.erp.finance.invoice.entity.Receipt receipt = new com.erp.finance.invoice.entity.Receipt();
                            receipt.setReceiptNumber(rr.getReceiptNumber());
                            receipt.setPayment(pay);
                            receipt.setStudentId(pay.getStudentId());
                            receipt.setStatus(pay.getStatus());
                            receiptRepository.save(receipt);
                        }
                    }
                }
            }

            // Hydrate Rooms
            Path roomFile = storageDir.resolve("rooms.json");
            if (Files.exists(roomFile) && roomRepository != null) {
                List<RoomRecord> roomRecords = storageEngine.readList(roomFile, RoomRecord.class);
                for (RoomRecord rr : roomRecords) {
                    boolean exists = roomRepository.findAll().stream().anyMatch(r -> r.getName() != null && r.getName().equalsIgnoreCase(rr.getName()));
                    if (!exists) {
                        com.erp.academic.room.entity.Room room = new com.erp.academic.room.entity.Room();
                        room.setName(rr.getName());
                        room.setCapacity(rr.getCapacity() != null ? rr.getCapacity() : 30);
                        room.setIsActive(rr.getIsActive() != null ? rr.getIsActive() : true);
                        roomRepository.save(room);
                    }
                }
            }

            // Hydrate Institutions
            Path instFile = storageDir.resolve("institutions.json");
            if (Files.exists(instFile) && institutionRepository != null) {
                List<InstitutionRecord> instRecords = storageEngine.readList(instFile, InstitutionRecord.class);
                for (InstitutionRecord ir : instRecords) {
                    boolean exists = institutionRepository.findAll().stream().anyMatch(i -> i.getCode() != null && i.getCode().equalsIgnoreCase(ir.getCode()));
                    if (!exists) {
                        com.erp.institution.entity.Institution inst = new com.erp.institution.entity.Institution();
                        inst.setName(ir.getName());
                        inst.setCode(ir.getCode());
                        if (ir.getCreatedAt() != null) inst.setCreatedAt(ir.getCreatedAt());
                        if (ir.getUpdatedAt() != null) inst.setUpdatedAt(ir.getUpdatedAt());
                        institutionRepository.save(inst);
                    }
                }
            }

            // Hydrate Campuses
            Path cmpFile = storageDir.resolve("campuses.json");
            if (Files.exists(cmpFile) && campusRepository != null) {
                List<CampusRecord> cmpRecords = storageEngine.readList(cmpFile, CampusRecord.class);
                for (CampusRecord cr : cmpRecords) {
                    boolean exists = campusRepository.findAll().stream().anyMatch(c -> c.getName() != null && c.getName().equalsIgnoreCase(cr.getName()));
                    if (!exists) {
                        com.erp.campus.entity.Campus cmp = new com.erp.campus.entity.Campus();
                        cmp.setName(cr.getName());
                        cmp.setAddress(cr.getAddress());
                        cmp.setInstitutionId(cr.getInstitutionId());
                        if (cr.getCreatedAt() != null) cmp.setCreatedAt(cr.getCreatedAt());
                        if (cr.getUpdatedAt() != null) cmp.setUpdatedAt(cr.getUpdatedAt());
                        campusRepository.save(cmp);
                    }
                }
            }

            // Hydrate Applicants
            Path appFile = storageDir.resolve("applicants.json");
            if (Files.exists(appFile) && applicantRepository != null) {
                List<ApplicantRecord> appRecords = storageEngine.readList(appFile, ApplicantRecord.class);
                for (ApplicantRecord ar : appRecords) {
                    boolean exists = applicantRepository.findAll().stream().anyMatch(a -> a.getEmail() != null && a.getEmail().equalsIgnoreCase(ar.getEmail()));
                    if (!exists) {
                        com.erp.admission.applicant.entity.Applicant applicant = new com.erp.admission.applicant.entity.Applicant();
                        applicant.setFirstName(ar.getFirstName());
                        applicant.setLastName(ar.getLastName());
                        applicant.setEmail(ar.getEmail());
                        applicant.setPhone(ar.getPhone());
                        applicant.setDateOfBirth(ar.getDateOfBirth());
                        applicant.setGender(ar.getGender());
                        applicant.setAddress(ar.getAddress());
                        if (ar.getCreatedAt() != null) applicant.setCreatedAt(ar.getCreatedAt());
                        applicantRepository.save(applicant);
                    }
                }
            }

            // Hydrate Admission Applications
            Path applnFile = storageDir.resolve("admission_applications.json");
            if (Files.exists(applnFile) && admissionApplicationRepository != null && applicantRepository != null) {
                List<AdmissionApplicationRecord> applnRecords = storageEngine.readList(applnFile, AdmissionApplicationRecord.class);
                for (AdmissionApplicationRecord aar : applnRecords) {
                    boolean exists = admissionApplicationRepository.findAll().stream().anyMatch(aa -> aa.getApplicationNumber() != null && aa.getApplicationNumber().equalsIgnoreCase(aar.getApplicationNumber()));
                    if (!exists) {
                        com.erp.admission.applicant.entity.Applicant applicant = aar.getApplicantId() != null ? applicantRepository.findById(aar.getApplicantId()).orElse(null) : null;
                        Program program = aar.getProgramId() != null ? programRepository.findById(aar.getProgramId()).orElse(null) : null;
                        AcademicYear academicYear = aar.getAcademicYearId() != null ? academicYearRepository.findById(aar.getAcademicYearId()).orElse(null) : null;

                        com.erp.admission.application.entity.AdmissionApplication appln = new com.erp.admission.application.entity.AdmissionApplication();
                        appln.setApplicationNumber(aar.getApplicationNumber());
                        appln.setApplicant(applicant);
                        appln.setProgram(program);
                        appln.setAcademicYear(academicYear);
                        if (aar.getStatus() != null) {
                            try {
                                appln.setStatus(ApplicationStatus.valueOf(aar.getStatus()));
                            } catch (Exception ignored) {
                                appln.setStatus(ApplicationStatus.SUBMITTED);
                            }
                        }
                        appln.setMeritScore(aar.getMeritScore());
                        appln.setReviewerRemarks(aar.getReviewerRemarks());
                        if (aar.getSubmittedAt() != null) appln.setSubmittedAt(aar.getSubmittedAt());
                        if (aar.getCreatedAt() != null) appln.setCreatedAt(aar.getCreatedAt());
                        admissionApplicationRepository.save(appln);
                    }
                }
            }

            // Hydrate Applicant Documents
            Path appDocFile = storageDir.resolve("applicant_documents.json");
            if (Files.exists(appDocFile) && applicantDocumentRepository != null && applicantRepository != null) {
                List<ApplicantDocumentRecord> appDocRecords = storageEngine.readList(appDocFile, ApplicantDocumentRecord.class);
                for (ApplicantDocumentRecord adr : appDocRecords) {
                    if (adr.getApplicantId() != null) {
                        com.erp.admission.applicant.entity.Applicant applicant = applicantRepository.findById(adr.getApplicantId()).orElse(null);
                        if (applicant != null) {
                            boolean exists = applicantDocumentRepository.findByApplicantId(applicant.getId()).stream()
                                    .anyMatch(d -> d.getDocumentType() != null && d.getDocumentType().equalsIgnoreCase(adr.getDocumentType()));
                            if (!exists) {
                                com.erp.admission.document.entity.ApplicantDocument ad = com.erp.admission.document.entity.ApplicantDocument.builder()
                                        .applicant(applicant)
                                        .documentType(adr.getDocumentType())
                                        .fileUrl(adr.getFileUrl())
                                        .verificationStatus(adr.getVerificationStatus() != null ? adr.getVerificationStatus() : "PENDING")
                                        .remarks(adr.getRemarks())
                                        .uploadedAt(adr.getUploadedAt() != null ? adr.getUploadedAt() : java.time.Instant.now())
                                        .verifiedAt(adr.getVerifiedAt())
                                        .build();
                                applicantDocumentRepository.save(ad);
                            }
                        }
                    }
                }
            }

            // Hydrate Student Documents
            Path stuDocFile = storageDir.resolve("student_documents.json");
            if (Files.exists(stuDocFile) && studentDocumentRepository != null && studentRepository != null) {
                List<StudentDocumentRecord> stuDocRecords = storageEngine.readList(stuDocFile, StudentDocumentRecord.class);
                for (StudentDocumentRecord sdr : stuDocRecords) {
                    if (sdr.getStudentId() != null) {
                        Student student = studentRepository.findById(sdr.getStudentId()).orElse(null);
                        if (student != null) {
                            com.erp.student.entity.DocumentType dt;
                            try {
                                dt = sdr.getDocumentType() != null ? com.erp.student.entity.DocumentType.valueOf(sdr.getDocumentType()) : com.erp.student.entity.DocumentType.MARKSHEET;
                            } catch (Exception ex) {
                                dt = com.erp.student.entity.DocumentType.MARKSHEET;
                            }
                            final com.erp.student.entity.DocumentType finalDt = dt;
                            boolean exists = studentDocumentRepository.findByStudentId(student.getId()).stream()
                                    .anyMatch(d -> d.getDocumentType() == finalDt && d.getFileName() != null && d.getFileName().equalsIgnoreCase(sdr.getFileName()));
                            if (!exists) {
                                com.erp.student.entity.StudentDocument sd = new com.erp.student.entity.StudentDocument(
                                        student,
                                        dt,
                                        sdr.getFileName(),
                                        sdr.getOriginalFileName() != null ? sdr.getOriginalFileName() : sdr.getFileName(),
                                        sdr.getFileType() != null ? sdr.getFileType() : "application/octet-stream",
                                        sdr.getFileSize() != null ? sdr.getFileSize() : 0L,
                                        sdr.getStoragePath()
                                );
                                if (sdr.getUploadedAt() != null) {
                                    sd.setUploadedAt(sdr.getUploadedAt());
                                }
                                studentDocumentRepository.save(sd);
                            }
                        }
                    }
                }
            }

            log.info("DevJsonDataHydrator successfully hydrated records from {}", storageDir);
        } catch (Exception e) {
            log.error("DevJsonDataHydrator failed during startup hydration: {}", e.getMessage(), e);
        }
    }
}
