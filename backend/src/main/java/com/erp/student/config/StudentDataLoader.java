package com.erp.student.config;

import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.DocumentType;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentDocument;
import com.erp.student.entity.StudentStatus;
import com.erp.student.entity.StudentStatusHistory;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.student.repository.StudentRepository;
import com.erp.student.repository.StudentStatusHistoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@Profile("dev")
public class StudentDataLoader implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;
    private final StudentDocumentRepository documentRepository;
    private final StudentStatusHistoryRepository statusHistoryRepository;

    public StudentDataLoader(StudentRepository studentRepository,
                             GuardianRepository guardianRepository,
                             StudentDocumentRepository documentRepository,
                             StudentStatusHistoryRepository statusHistoryRepository) {
        this.studentRepository = studentRepository;
        this.guardianRepository = guardianRepository;
        this.documentRepository = documentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (studentRepository.count() > 0) {
            return;
        }

        // Ensure uploads directory exists
        Files.createDirectories(Paths.get("uploads/documents"));

        // Student 1: Aarav Sharma (Active)
        Student s1 = new Student("2023-CSE-001", "Aarav", "Sharma", "aarav.sharma@college.edu",
                "+919876543210", LocalDate.of(2004, 6, 15), "MALE", "Computer Science and Engineering",
                "2023-2027", LocalDate.of(2023, 8, 1));
        s1.setBloodGroup("O+");
        s1.setAddress("Flat 402, Sunshine Heights");
        s1.setCity("New Delhi");
        s1.setState("Delhi");
        s1.setPincode("110001");
        s1.setProgram("B.Tech Computer Science");
        s1.setStatus(StudentStatus.ACTIVE);
        s1 = studentRepository.save(s1);

        Guardian g1 = new Guardian("Rajesh", "Sharma", "FATHER", "+919811223344", "rajesh.sharma@example.com");
        g1.setOccupation("Senior Software Architect");
        g1.setAddress("Flat 402, Sunshine Heights, New Delhi");
        g1.setIsEmergencyContact(true);
        g1.setStudent(s1);
        guardianRepository.save(g1);

        Guardian g2 = new Guardian("Sunita", "Sharma", "MOTHER", "+919811223355", "sunita.sharma@example.com");
        g2.setOccupation("Professor");
        g2.setAddress("Flat 402, Sunshine Heights, New Delhi");
        g2.setIsEmergencyContact(false);
        g2.setStudent(s1);
        guardianRepository.save(g2);

        // Create sample dummy document on disk
        String docPath1 = "uploads/documents/1_AADHAAR_sample.pdf";
        try (FileOutputStream fos = new FileOutputStream(new File(docPath1))) {
            fos.write("%PDF-1.4 Sample Aadhaar Document Content for Testing".getBytes());
        }
        StudentDocument d1 = new StudentDocument(s1, DocumentType.AADHAAR, "1_AADHAAR_sample.pdf",
                "aadhaar_aarav_sharma.pdf", "application/pdf", 102400L, Paths.get(docPath1).toAbsolutePath().toString());
        documentRepository.save(d1);

        StudentStatusHistory sh1 = new StudentStatusHistory(s1, null, StudentStatus.ACTIVE,
                "Initial student enrollment confirmed", "admissions_office", java.time.LocalDate.now());
        statusHistoryRepository.save(sh1);

        // Student 2: Diya Mehta (Active)
        Student s2 = new Student("2023-CSE-002", "Diya", "Mehta", "diya.mehta@college.edu",
                "+919876543211", LocalDate.of(2004, 9, 22), "FEMALE", "Computer Science and Engineering",
                "2023-2027", LocalDate.of(2023, 8, 1));
        s2.setBloodGroup("B+");
        s2.setAddress("House 12, Green Park");
        s2.setCity("Bengaluru");
        s2.setState("Karnataka");
        s2.setPincode("560001");
        s2.setProgram("B.Tech Computer Science");
        s2.setStatus(StudentStatus.ACTIVE);
        s2 = studentRepository.save(s2);

        Guardian g3 = new Guardian("Kishore", "Mehta", "FATHER", "+919822334455", "kishore.mehta@example.com");
        g3.setOccupation("Business Executive");
        g3.setAddress("House 12, Green Park, Bengaluru");
        g3.setIsEmergencyContact(true);
        g3.setStudent(s2);
        guardianRepository.save(g3);

        StudentStatusHistory sh2 = new StudentStatusHistory(s2, null, StudentStatus.ACTIVE,
                "Initial student enrollment confirmed", "admissions_office", java.time.LocalDate.now());
        statusHistoryRepository.save(sh2);

        // Student 3: Rohan Iyer (Suspended)
        Student s3 = new Student("2022-ECE-015", "Rohan", "Iyer", "rohan.iyer@college.edu",
                "+919876543212", LocalDate.of(2003, 12, 5), "MALE", "Electronics and Communication Engineering",
                "2022-2026", LocalDate.of(2022, 8, 1));
        s3.setBloodGroup("A+");
        s3.setAddress("Plot 88, Sector 14");
        s3.setCity("Chennai");
        s3.setState("Tamil Nadu");
        s3.setPincode("600001");
        s3.setProgram("B.Tech ECE");
        s3.setStatus(StudentStatus.SUSPENDED);
        s3 = studentRepository.save(s3);

        Guardian g4 = new Guardian("Venkat", "Iyer", "FATHER", "+919833445566", "venkat.iyer@example.com");
        g4.setOccupation("Bank Manager");
        g4.setAddress("Plot 88, Sector 14, Chennai");
        g4.setIsEmergencyContact(true);
        g4.setStudent(s3);
        guardianRepository.save(g4);

        StudentStatusHistory sh3_1 = new StudentStatusHistory(s3, null, StudentStatus.ACTIVE,
                "Initial student enrollment confirmed", "admissions_office", java.time.LocalDate.now());
        StudentStatusHistory sh3_2 = new StudentStatusHistory(s3, StudentStatus.ACTIVE, StudentStatus.SUSPENDED,
                "Attendance shortage below 60% requirement", "dean_academics", java.time.LocalDate.now());
        statusHistoryRepository.save(sh3_1);
        statusHistoryRepository.save(sh3_2);

        // Student 4: Priya Singh (Graduated)
        Student s4 = new Student("2020-MECH-042", "Priya", "Singh", "priya.singh@college.edu",
                "+919876543213", LocalDate.of(2002, 4, 18), "FEMALE", "Mechanical Engineering",
                "2020-2024", LocalDate.of(2020, 8, 1));
        s4.setBloodGroup("AB+");
        s4.setCity("Pune");
        s4.setState("Maharashtra");
        s4.setProgram("B.Tech Mechanical");
        s4.setStatus(StudentStatus.GRADUATED);
        studentRepository.save(s4);

        // Student 5: Vikram Rao (Alumni)
        Student s5 = new Student("2019-CIVIL-009", "Vikram", "Rao", "vikram.rao@college.edu",
                "+919876543214", LocalDate.of(2001, 1, 30), "MALE", "Civil Engineering",
                "2019-2023", LocalDate.of(2019, 8, 1));
        s5.setBloodGroup("O-");
        s5.setCity("Hyderabad");
        s5.setState("Telangana");
        s5.setProgram("B.Tech Civil");
        s5.setStatus(StudentStatus.ALUMNI);
        studentRepository.save(s5);
    }
}
