const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'backend', 'src', 'main', 'java', 'com', 'erp', 'admission');

const dirs = ['entity', 'dto', 'repository', 'service', 'controller'];
dirs.forEach(d => fs.mkdirSync(path.join(basePath, d), { recursive: true }));

const files = {
    'entity/Applicant.java': `package com.erp.admission.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "applicants")
public class Applicant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Instant inquiryDate = Instant.now();
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; } public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; } public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public Instant getInquiryDate() { return inquiryDate; } public void setInquiryDate(Instant inquiryDate) { this.inquiryDate = inquiryDate; }
}`,
    'entity/AdmissionApplication.java': `package com.erp.admission.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "admission_applications")
public class AdmissionApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long applicantId;
    private Long programId;
    private Long academicYearId;
    private String status;
    private Instant applicationDate = Instant.now();
    private String remarks;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getApplicantId() { return applicantId; } public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }
    public Long getProgramId() { return programId; } public void setProgramId(Long programId) { this.programId = programId; }
    public Long getAcademicYearId() { return academicYearId; } public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public Instant getApplicationDate() { return applicationDate; } public void setApplicationDate(Instant applicationDate) { this.applicationDate = applicationDate; }
    public String getRemarks() { return remarks; } public void setRemarks(String remarks) { this.remarks = remarks; }
}`,
    'repository/ApplicantRepository.java': `package com.erp.admission.repository;
import com.erp.admission.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {}`,
    'repository/AdmissionApplicationRepository.java': `package com.erp.admission.repository;
import com.erp.admission.entity.AdmissionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, Long> {}`,
    'service/AdmissionService.java': `package com.erp.admission.service;
import com.erp.admission.entity.Applicant;
import com.erp.admission.entity.AdmissionApplication;
import com.erp.admission.repository.ApplicantRepository;
import com.erp.admission.repository.AdmissionApplicationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class AdmissionService {
    private final ApplicantRepository applicantRepository;
    private final AdmissionApplicationRepository applicationRepository;
    public AdmissionService(ApplicantRepository applicantRepository, AdmissionApplicationRepository applicationRepository) {
        this.applicantRepository = applicantRepository;
        this.applicationRepository = applicationRepository;
    }
    public List<Applicant> getAllApplicants() { return applicantRepository.findAll(); }
    public List<AdmissionApplication> getAllApplications() { return applicationRepository.findAll(); }
    public Applicant createApplicant(Applicant a) { return applicantRepository.save(a); }
    public AdmissionApplication createApplication(AdmissionApplication a) { return applicationRepository.save(a); }
}`,
    'controller/AdmissionController.java': `package com.erp.admission.controller;
import com.erp.admission.entity.Applicant;
import com.erp.admission.entity.AdmissionApplication;
import com.erp.admission.service.AdmissionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/v1")
public class AdmissionController {
    private final AdmissionService admissionService;
    public AdmissionController(AdmissionService admissionService) { this.admissionService = admissionService; }
    @GetMapping("/applicants") public List<Applicant> getApplicants() { return admissionService.getAllApplicants(); }
    @PostMapping("/applicants") public Applicant createApplicant(@RequestBody Applicant a) { return admissionService.createApplicant(a); }
    @GetMapping("/admission-applications") public List<AdmissionApplication> getApplications() { return admissionService.getAllApplications(); }
    @PostMapping("/admission-applications") public AdmissionApplication createApplication(@RequestBody AdmissionApplication a) { return admissionService.createApplication(a); }
}`
};

for (const [file, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(basePath, file), content, 'utf8');
}
console.log("Admission module created.");