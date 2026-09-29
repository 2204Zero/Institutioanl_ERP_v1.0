package com.erp.institution;

import com.erp.institution.dto.InstitutionCreateRequest;
import com.erp.institution.dto.InstitutionResponse;
import com.erp.institution.service.InstitutionService;
import com.erp.campus.dto.CampusCreateRequest;
import com.erp.campus.dto.CampusResponse;
import com.erp.campus.service.CampusService;
import com.erp.department.dto.DepartmentCreateRequest;
import com.erp.department.dto.DepartmentResponse;
import com.erp.department.service.DepartmentService;
import com.erp.academic.academic_year.dto.AcademicYearCreateRequest;
import com.erp.academic.academic_year.dto.AcademicYearResponse;
import com.erp.academic.academic_year.service.AcademicYearService;
import com.erp.academic.semester.dto.SemesterCreateRequest;
import com.erp.academic.semester.dto.SemesterResponse;
import com.erp.academic.semester.service.SemesterService;
import com.erp.academic.program.dto.ProgramCreateRequest;
import com.erp.academic.program.dto.ProgramResponse;
import com.erp.academic.program.service.ProgramService;
import com.erp.academic.batch.dto.BatchCreateRequest;
import com.erp.academic.batch.dto.BatchResponse;
import com.erp.academic.batch.service.BatchService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@SpringBootTest
public class InstitutionFlowTest {

    @Autowired private InstitutionService institutionService;
    @Autowired private CampusService campusService;
    @Autowired private DepartmentService departmentService;
    @Autowired private AcademicYearService academicYearService;
    @Autowired private SemesterService semesterService;
    @Autowired private ProgramService programService;
    @Autowired private BatchService batchService;

    @Test
    @Transactional
    public void demonstrateInstitutionHierarchy() {
        System.out.println("========== STARTING ERP FOUNDATION DEMONSTRATION ==========\n");

        // 1. Create Institution
        InstitutionResponse institution = institutionService.create(
            new InstitutionCreateRequest("Global Tech University", "GTU")
        );
        System.out.println("[Institution Created] -> " + institution);

        // 2. Create Campus
        CampusResponse campus = campusService.create(
            new CampusCreateRequest("Main Campus", "123 Tech Blvd", institution.id())
        );
        System.out.println("[Campus Created] -> " + campus);

        // 3. Create Department
        DepartmentResponse department = departmentService.create(
            new DepartmentCreateRequest("Computer Science", "CS", campus.id())
        );
        System.out.println("[Department Created] -> " + department);

        // 4. Create Academic Year
        AcademicYearResponse academicYear = academicYearService.create(
            new AcademicYearCreateRequest("2026-2027", LocalDate.of(2026, 9, 1), LocalDate.of(2027, 8, 31), true)
        );
        System.out.println("[Academic Year Created] -> " + academicYear);

        // 5. Create Semester
        SemesterCreateRequest semesterReq = new SemesterCreateRequest();
        semesterReq.setName("Fall 2026");
        semesterReq.setAcademicYearId(academicYear.id());
        semesterReq.setIsActive(true);
        SemesterResponse semester = semesterService.create(semesterReq);
        System.out.println("[Semester Created] -> " + semester);

        // 6. Create Program
        ProgramCreateRequest programReq = new ProgramCreateRequest();
        programReq.setName("B.Tech Computer Science");
        programReq.setCode("BTECH-CS");
        programReq.setDepartmentId(department.id());
        programReq.setIsActive(true);
        ProgramResponse program = programService.create(programReq);
        System.out.println("[Program Created] -> " + program);

        // 7. Create Batch
        BatchCreateRequest batchReq = new BatchCreateRequest();
        batchReq.setName("Class of 2030");
        batchReq.setProgramId(program.getId());
        batchReq.setAcademicYearId(academicYear.id());
        batchReq.setIsActive(true);
        BatchResponse batch = batchService.create(batchReq);
        System.out.println("[Batch Created] -> " + batch);

        System.out.println("\n========== DEMONSTRATION SUCCESSFUL ==========");
    }
}
