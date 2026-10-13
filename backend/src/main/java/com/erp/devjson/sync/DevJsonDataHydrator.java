package com.erp.devjson.sync;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
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
import com.erp.devjson.model.FacultyJsonModels.FacultyRecord;
import com.erp.devjson.model.GuardianJsonModels.GuardianRecord;
import com.erp.devjson.model.StudentJsonModels.*;
import com.erp.devjson.model.TimetableJsonModels.TimetableSlotRecord;
import com.erp.devjson.model.UserJsonModels.*;
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
            TimetableSlotRepository timetableSlotRepository) {
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
    }

    @EventListener(ApplicationReadyEvent.class)
    public void hydrateOnStartup() {
        if (!Files.exists(storageDir)) {
            log.info("DevJson storage directory {} does not exist yet. Skipping hydration.", storageDir);
            return;
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
                for (StudentRecord s : studentRecords) {
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
                    }
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
                        batch.setCode(b.getCode());
                        batch.setProgramId(b.getProgramId());
                        batch.setAdmissionYear(b.getAdmissionYear());
                        batch.setGraduationYear(b.getGraduationYear());
                        batch.setAcademicYearId(b.getAcademicYearId());
                        batch.setIsActive(true);
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

            // 13. Hydrate Timetable Slots
            Path tsFile = storageDir.resolve("timetable_slots.json");
            if (Files.exists(tsFile)) {
                List<TimetableSlotRecord> tsRecords = storageEngine.readList(tsFile, TimetableSlotRecord.class);
                for (TimetableSlotRecord ts : tsRecords) {
                    if (ts.getId() != null && timetableSlotRepository.findById(ts.getId()).isEmpty()) {
                        DayOfWeek dow = ts.getDayOfWeek() != null ? DayOfWeek.of(ts.getDayOfWeek()) : DayOfWeek.MONDAY;
                        Long roomId = 101L;
                        if (ts.getRoom() != null && ts.getRoom().startsWith("Room-")) {
                            try {
                                roomId = Long.parseLong(ts.getRoom().substring(5));
                            } catch (Exception ignored) {}
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

            log.info("DevJsonDataHydrator successfully hydrated records from {}", storageDir);
        } catch (Exception e) {
            log.error("DevJsonDataHydrator failed during startup hydration: {}", e.getMessage(), e);
        }
    }
}
