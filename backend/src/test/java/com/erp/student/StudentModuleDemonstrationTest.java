package com.erp.student;

import com.erp.common.exception.GlobalExceptionHandler;
import com.erp.guardian.controller.GuardianController;
import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.student.controller.StudentController;
import com.erp.student.controller.StudentDocumentController;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.dto.StudentStatusUpdateDto;
import com.erp.student.entity.DocumentType;
import com.erp.student.entity.StudentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class StudentModuleDemonstrationTest {

    @Autowired
    private StudentController studentController;

    @Autowired
    private GuardianController guardianController;

    @Autowired
    private StudentDocumentController documentController;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    private MockMvc studentMvc;
    private MockMvc guardianMvc;
    private MockMvc documentMvc;
    private ObjectMapper mapper;

    @BeforeEach
    void setup() {
        studentMvc = MockMvcBuilders.standaloneSetup(studentController)
                .setControllerAdvice(globalExceptionHandler).build();
        guardianMvc = MockMvcBuilders.standaloneSetup(guardianController)
                .setControllerAdvice(globalExceptionHandler).build();
        documentMvc = MockMvcBuilders.standaloneSetup(documentController)
                .setControllerAdvice(globalExceptionHandler).build();

        mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.setSerializationInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);
    }

    private void printHeader(String title) {
        System.out.println("\n" + "=".repeat(80));
        System.out.println("  " + title);
        System.out.println("=".repeat(80));
    }

    private void printStep(String stepNumber, String stepName, Object inputObj, String outputJson, int status) {
        System.out.println("\n--> [STEP " + stepNumber + "] " + stepName);
        System.out.println("    HTTP STATUS CODE : " + status);
        if (inputObj != null) {
            try {
                System.out.println("    INPUT (Function Argument / Request Payload):");
                System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(inputObj).indent(6));
            } catch (Exception e) {
                System.out.println("    INPUT: " + inputObj);
            }
        }
        System.out.println("    OUTPUT (Returned DTO / Response Object):");
        try {
            Object parsed = mapper.readValue(outputJson, Object.class);
            System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(parsed).indent(6));
        } catch (Exception e) {
            System.out.println(outputJson.indent(6));
        }
    }

    @Test
    @DisplayName("Meeting Live Demo: Demonstrate Outputs for Day 01 through Day 06")
    void runCompleteDemonstration() throws Exception {
        printHeader("DEMONSTRATION OF STUDENT INFORMATION SYSTEM (SIS) - PALAK AGARWAL");

        // -------------------------------------------------------------
        // DAY 02: STUDENT PROFILE CRUD
        // -------------------------------------------------------------
        printHeader("DAY 02: STUDENT PROFILE MODULE - CRUD OPERATIONS");

        // 1. Add Student
        StudentRequestDto createDto = new StudentRequestDto();
        createDto.setRollNumber("2024-CSE-999");
        createDto.setFirstName("Palak");
        createDto.setLastName("Agarwal");
        createDto.setEmail("palak.agarwal.demo@college.edu");
        createDto.setPhone("+919876543299");
        createDto.setDateOfBirth(LocalDate.of(2004, 11, 20));
        createDto.setGender("FEMALE");
        createDto.setBloodGroup("A+");
        createDto.setAddress("Tower 4, Green Glades");
        createDto.setCity("Gurugram");
        createDto.setState("Haryana");
        createDto.setPincode("122001");
        createDto.setDepartment("Computer Science and Engineering");
        createDto.setProgram("B.Tech CSE");
        createDto.setBatch("2024-2028");
        createDto.setEnrollmentDate(LocalDate.of(2024, 8, 1));
        createDto.setStatus(StudentStatus.ACTIVE);

        MvcResult addStudentRes = studentMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn();

        String addStudentOut = addStudentRes.getResponse().getContentAsString();
        printStep("2.1", "Add Student (POST /api/v1/students)", createDto, addStudentOut, 201);

        long studentId = mapper.readTree(addStudentOut).path("data").path("id").asLong();

        // 2. View Student by ID
        MvcResult getStudentRes = studentMvc.perform(get("/api/v1/students/" + studentId))
                .andExpect(status().isOk())
                .andReturn();
        printStep("2.2", "View Student by ID (GET /api/v1/students/" + studentId + ")", "Path variable id=" + studentId, getStudentRes.getResponse().getContentAsString(), 200);

        // 3. Edit Student
        createDto.setAddress("Penthouse 12, Sky Villas, Sector 56");
        createDto.setCity("Gurugram");
        MvcResult updateStudentRes = studentMvc.perform(put("/api/v1/students/" + studentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(createDto)))
                .andExpect(status().isOk())
                .andReturn();
        printStep("2.3", "Edit Student (PUT /api/v1/students/" + studentId + ")", createDto, updateStudentRes.getResponse().getContentAsString(), 200);

        // 4. List Students (Paginated)
        MvcResult listStudentsRes = studentMvc.perform(get("/api/v1/students")
                        .param("search", "Palak")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andReturn();
        printStep("2.4", "List Students (GET /api/v1/students?search=Palak&page=0&size=5)", "Query: search=Palak, page=0, size=5", listStudentsRes.getResponse().getContentAsString(), 200);

        // -------------------------------------------------------------
        // DAY 03: GUARDIAN MANAGEMENT
        // -------------------------------------------------------------
        printHeader("DAY 03: GUARDIAN MANAGEMENT MODULE");

        GuardianRequestDto guardianDto = new GuardianRequestDto();
        guardianDto.setStudentId(studentId);
        guardianDto.setFirstName("Sunil");
        guardianDto.setLastName("Agarwal");
        guardianDto.setRelation("FATHER");
        guardianDto.setPhone("+919811229988");
        guardianDto.setEmail("sunil.agarwal@example.com");
        guardianDto.setOccupation("Chartered Accountant");
        guardianDto.setAddress("Tower 4, Green Glades, Gurugram");
        guardianDto.setIsEmergencyContact(true);

        MvcResult addGuardianRes = guardianMvc.perform(post("/api/v1/students/" + studentId + "/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(guardianDto)))
                .andExpect(status().isCreated())
                .andReturn();
        String addGuardianOut = addGuardianRes.getResponse().getContentAsString();
        printStep("3.1", "Add & Link Guardian to Student (POST /api/v1/students/" + studentId + "/guardians)", guardianDto, addGuardianOut, 201);

        long guardianId = mapper.readTree(addGuardianOut).path("data").path("id").asLong();

        // View guardians for student
        MvcResult getStudentGuardiansRes = guardianMvc.perform(get("/api/v1/students/" + studentId + "/guardians"))
                .andExpect(status().isOk())
                .andReturn();
        printStep("3.2", "Get Guardians for Student (GET /api/v1/students/" + studentId + "/guardians)", "Path variable studentId=" + studentId, getStudentGuardiansRes.getResponse().getContentAsString(), 200);

        // Edit guardian
        guardianDto.setOccupation("Chief Financial Officer");
        MvcResult updateGuardianRes = guardianMvc.perform(put("/guardians/" + guardianId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(guardianDto)))
                .andExpect(status().isOk())
                .andReturn();
        printStep("3.3", "Edit Guardian (PUT /guardians/" + guardianId + ")", guardianDto, updateGuardianRes.getResponse().getContentAsString(), 200);

        // -------------------------------------------------------------
        // DAY 04: STUDENT DOCUMENTS
        // -------------------------------------------------------------
        printHeader("DAY 04: STUDENT DOCUMENTS MODULE");

        MockMultipartFile aadhaarFile = new MockMultipartFile(
                "file",
                "aadhaar_card_palak.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "%PDF-1.4 [Government of India - Unique Identification Authority] Mock Aadhaar Document".getBytes()
        );

        MvcResult uploadDocRes = documentMvc.perform(multipart("/api/v1/students/" + studentId + "/documents")
                        .file(aadhaarFile)
                        .param("documentType", DocumentType.AADHAAR.name()))
                .andExpect(status().isCreated())
                .andReturn();
        String uploadDocOut = uploadDocRes.getResponse().getContentAsString();
        printStep("4.1", "Upload Aadhaar Document (POST /api/v1/students/" + studentId + "/documents)", "File: aadhaar_card_palak.pdf, Type: AADHAAR", uploadDocOut, 201);

        long docId = mapper.readTree(uploadDocOut).path("data").path("id").asLong();

        // List student documents
        MvcResult listDocsRes = documentMvc.perform(get("/api/v1/students/" + studentId + "/documents"))
                .andExpect(status().isOk())
                .andReturn();
        printStep("4.2", "List Student Documents (GET /api/v1/students/" + studentId + "/documents)", "Path variable studentId=" + studentId, listDocsRes.getResponse().getContentAsString(), 200);

        // View Document inline
        MvcResult viewDocRes = documentMvc.perform(get("/api/v1/documents/" + docId + "/view"))
                .andExpect(status().isOk())
                .andReturn();
        System.out.println("\n--> [STEP 4.3] View Document Inline (GET /api/v1/documents/" + docId + "/view)");
        System.out.println("    HTTP STATUS CODE : 200");
        System.out.println("    HEADER Content-Disposition : " + viewDocRes.getResponse().getHeader("Content-Disposition"));
        System.out.println("    HEADER Content-Type        : " + viewDocRes.getResponse().getContentType());
        System.out.println("    OUTPUT: Binary file stream ready for browser preview.");

        // -------------------------------------------------------------
        // DAY 05: STUDENT STATUS & AUDIT
        // -------------------------------------------------------------
        printHeader("DAY 05: STUDENT STATUS WORKFLOW & AUDIT TRAIL");

        StudentStatusUpdateDto statusUpdate = new StudentStatusUpdateDto(
                StudentStatus.SUSPENDED,
                "Attendance shortage below minimum 60% requirement in Semester 2",
                "dean_academics"
        );

        MvcResult updateStatusRes = studentMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andReturn();
        printStep("5.1", "Update Status to SUSPENDED (PATCH /api/v1/students/" + studentId + "/status)", statusUpdate, updateStatusRes.getResponse().getContentAsString(), 200);

        // View status history audit log
        MvcResult getHistoryRes = studentMvc.perform(get("/api/v1/students/" + studentId + "/status-history"))
                .andExpect(status().isOk())
                .andReturn();
        printStep("5.2", "View Student Status History Audit (GET /api/v1/students/" + studentId + "/status-history)", "Path variable id=" + studentId, getHistoryRes.getResponse().getContentAsString(), 200);

        // -------------------------------------------------------------
        // DAY 06: API TESTING & EXCEPTION VALIDATION
        // -------------------------------------------------------------
        printHeader("DAY 06: API VALIDATION & EXCEPTION HANDLING");

        // 1. Validation Error (400 Bad Request)
        StudentRequestDto invalidDto = new StudentRequestDto();
        invalidDto.setRollNumber(""); // Blank
        invalidDto.setEmail("invalid-email-pattern");

        MvcResult badReqRes = studentMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andReturn();
        printStep("6.1", "Validation Failure Handling (400 BAD REQUEST)", invalidDto, badReqRes.getResponse().getContentAsString(), 400);

        // 2. Resource Not Found (404 Not Found)
        MvcResult notFoundRes = studentMvc.perform(get("/api/v1/students/999999"))
                .andExpect(status().isNotFound())
                .andReturn();
        printStep("6.2", "Resource Not Found Handling (404 NOT FOUND)", "Request ID = 999999", notFoundRes.getResponse().getContentAsString(), 404);

        printHeader("ALL MODULES SUCCESSFULLY DEMONSTRATED! ALL OUTPUTS VALIDATED.");
    }
}
