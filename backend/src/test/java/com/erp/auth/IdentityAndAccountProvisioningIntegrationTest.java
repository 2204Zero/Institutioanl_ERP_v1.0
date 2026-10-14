package com.erp.auth;

import com.erp.auth.dto.LoginRequest;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class IdentityAndAccountProvisioningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GuardianRepository guardianRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String getAdminToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "Admin@123", "ADMIN");
        MvcResult res = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).path("accessToken").asText();
    }

    @Test
    @DisplayName("Enrolling a student auto-provisions a login account, sets transient credentials, and allows student self-resolution")
    void testStudentAutoProvisioningAndSelfResolution() throws Exception {
        String adminToken = getAdminToken();

        StudentRequestDto request = new StudentRequestDto();
        request.setFirstName("Ada");
        request.setLastName("Lovelace");
        request.setEmail("ada.lovelace@institution.edu");
        request.setPhone("+1234567890");
        request.setDateOfBirth(LocalDate.of(2004, 12, 10));
        request.setGender("FEMALE");
        request.setDepartment("Computer Science");
        request.setBatch("2024-2028");
        request.setEnrollmentDate(LocalDate.now());

        // 1. Admin enrolls student
        MvcResult createResult = mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.userId").isNotEmpty())
                .andExpect(jsonPath("$.data.temporaryPassword").isNotEmpty())
                .andExpect(jsonPath("$.data.username").isNotEmpty())
                .andReturn();

        JsonNode createdJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        Long studentId = createdJson.path("data").path("id").asLong();
        Long userId = createdJson.path("data").path("userId").asLong();
        String tempPassword = createdJson.path("data").path("temporaryPassword").asText();
        String username = createdJson.path("data").path("username").asText();

        // Verify AppUser entity state in database
        Optional<AppUser> userOpt = userRepository.findById(userId);
        assertThat(userOpt).isPresent();
        AppUser user = userOpt.get();
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
        assertThat(user.getEmail()).isEqualTo("ada.lovelace@institution.edu");
        assertThat(passwordEncoder.matches(tempPassword, user.getPassword())).isTrue();

        // 2. Student authenticates via login endpoint
        LoginRequest loginRequest = new LoginRequest(username, tempPassword, "STUDENT");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String studentToken = loginJson.path("accessToken").asText();

        // 3. Student calls personal portal endpoint /api/v1/students/me
        mockMvc.perform(get("/api/v1/students/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(studentId))
                .andExpect(jsonPath("$.data.email").value("ada.lovelace@institution.edu"))
                .andExpect(jsonPath("$.data.firstName").value("Ada"))
                .andExpect(jsonPath("$.data.temporaryPassword").doesNotExist()); // No password leak on read
    }

    @Test
    @DisplayName("Enrolling a student with guardian auto-provisions guardian login account and allows guardian ward access")
    void testGuardianAutoProvisioningAndWardAccess() throws Exception {
        String adminToken = getAdminToken();

        GuardianRequestDto guardianDto = new GuardianRequestDto();
        guardianDto.setFirstName("Marie");
        guardianDto.setLastName("Curie");
        guardianDto.setRelation("MOTHER");
        guardianDto.setPhone("+1987654321");
        guardianDto.setEmail("marie.curie@parent.org");

        StudentRequestDto request = new StudentRequestDto();
        request.setFirstName("Irene");
        request.setLastName("Curie");
        request.setEmail("irene.curie@institution.edu");
        request.setPhone("+1122334455");
        request.setDateOfBirth(LocalDate.of(2005, 9, 12));
        request.setGender("FEMALE");
        request.setDepartment("Computer Science");
        request.setBatch("2024-2028");
        request.setEnrollmentDate(LocalDate.now());
        request.setGuardian(guardianDto);

        // 1. Admin enrolls student with guardian
        MvcResult createResult = mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.guardians").isArray())
                .andExpect(jsonPath("$.data.guardians[0].userId").isNotEmpty())
                .andExpect(jsonPath("$.data.guardians[0].temporaryPassword").isNotEmpty())
                .andExpect(jsonPath("$.data.guardians[0].username").isNotEmpty())
                .andReturn();

        JsonNode createdJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        Long wardStudentId = createdJson.path("data").path("id").asLong();
        Long guardianUserId = createdJson.path("data").path("guardians").get(0).path("userId").asLong();
        String guardianTempPassword = createdJson.path("data").path("guardians").get(0).path("temporaryPassword").asText();
        String guardianUsername = createdJson.path("data").path("guardians").get(0).path("username").asText();

        // Verify Guardian AppUser
        Optional<AppUser> guardianUserOpt = userRepository.findById(guardianUserId);
        assertThat(guardianUserOpt).isPresent();
        AppUser guardianUser = guardianUserOpt.get();
        assertThat(guardianUser.getRole()).isEqualTo(Role.PARENT);
        assertThat(passwordEncoder.matches(guardianTempPassword, guardianUser.getPassword())).isTrue();

        // 2. Guardian logs in
        LoginRequest loginRequest = new LoginRequest(guardianUsername, guardianTempPassword, "PARENT");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("PARENT"))
                .andReturn();

        String guardianToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("accessToken").asText();

        // 3. Guardian views their guardian profiles
        mockMvc.perform(get("/api/v1/guardians/me")
                        .header("Authorization", "Bearer " + guardianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].studentId").value(wardStudentId));

        // 4. Guardian accesses authorized ward details
        mockMvc.perform(get("/api/v1/students/" + wardStudentId)
                        .header("Authorization", "Bearer " + guardianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(wardStudentId));
    }

    @Test
    @DisplayName("Support existing guardian with multiple wards: second ward links to existing parent account without unlinking first ward")
    void testMultiWardGuardianLinking() throws Exception {
        String adminToken = getAdminToken();

        // Enrol Ward 1
        GuardianRequestDto guardianDto = new GuardianRequestDto();
        guardianDto.setFirstName("Thomas");
        guardianDto.setLastName("Wayne");
        guardianDto.setRelation("FATHER");
        guardianDto.setPhone("+1555000111");
        guardianDto.setEmail("thomas.wayne@parent.org");

        StudentRequestDto ward1Req = new StudentRequestDto();
        ward1Req.setFirstName("Bruce");
        ward1Req.setLastName("Wayne");
        ward1Req.setEmail("bruce.wayne@institution.edu");
        ward1Req.setPhone("+1555111222");
        ward1Req.setDateOfBirth(LocalDate.of(2004, 2, 19));
        ward1Req.setGender("MALE");
        ward1Req.setDepartment("Computer Science");
        ward1Req.setBatch("2024-2028");
        ward1Req.setEnrollmentDate(LocalDate.now());
        ward1Req.setGuardian(guardianDto);

        MvcResult ward1Res = mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ward1Req)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode ward1Json = objectMapper.readTree(ward1Res.getResponse().getContentAsString());
        Long ward1Id = ward1Json.path("data").path("id").asLong();
        Long parentUserId = ward1Json.path("data").path("guardians").get(0).path("userId").asLong();
        String parentPassword = ward1Json.path("data").path("guardians").get(0).path("temporaryPassword").asText();
        String parentUsername = ward1Json.path("data").path("guardians").get(0).path("username").asText();

        // Enrol Ward 2 with the identical parent email
        StudentRequestDto ward2Req = new StudentRequestDto();
        ward2Req.setFirstName("ThomasJr");
        ward2Req.setLastName("Wayne");
        ward2Req.setEmail("thomasjr.wayne@institution.edu");
        ward2Req.setPhone("+1555333444");
        ward2Req.setDateOfBirth(LocalDate.of(2006, 5, 10));
        ward2Req.setGender("MALE");
        ward2Req.setDepartment("Information Technology");
        ward2Req.setBatch("2024-2028");
        ward2Req.setEnrollmentDate(LocalDate.now());
        ward2Req.setGuardian(guardianDto);

        MvcResult ward2Res = mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ward2Req)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode ward2Json = objectMapper.readTree(ward2Res.getResponse().getContentAsString());
        Long ward2Id = ward2Json.path("data").path("id").asLong();
        Long parentUserIdWard2 = ward2Json.path("data").path("guardians").get(0).path("userId").asLong();

        // Verify the exact same AppUser is linked for both wards
        assertThat(parentUserIdWard2).isEqualTo(parentUserId);

        // Guardian logs in once
        LoginRequest loginRequest = new LoginRequest(parentUsername, parentPassword, "PARENT");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String parentToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("accessToken").asText();

        // Guardian calls /guardians/me and sees BOTH wards
        mockMvc.perform(get("/api/v1/guardians/me")
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));

        // Guardian can access both ward 1 and ward 2
        mockMvc.perform(get("/api/v1/students/" + ward1Id)
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/students/" + ward2Id)
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Linking existing student account without user duplication")
    void testExistingStudentAccountLinking() throws Exception {
        String adminToken = getAdminToken();

        // Pre-create user account with role STUDENT
        AppUser existingUser = new AppUser(
                "existing_student_alex",
                passwordEncoder.encode("Alex@Pass1234"),
                "alex.student@institution.edu",
                Role.STUDENT,
                true
        );
        userRepository.save(existingUser);

        StudentRequestDto request = new StudentRequestDto();
        request.setFirstName("Alex");
        request.setLastName("Student");
        request.setEmail("alex.student@institution.edu");
        request.setPhone("+1444555666");
        request.setDateOfBirth(LocalDate.of(2003, 7, 21));
        request.setGender("MALE");
        request.setDepartment("Mechanical Engineering");
        request.setBatch("2024-2028");
        request.setEnrollmentDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.userId").value(existingUser.getId()))
                .andExpect(jsonPath("$.data.temporaryPassword").doesNotExist()); // Existing account password is not overwritten or exposed

        // Existing student logs in with original password and resolves their profile
        LoginRequest loginRequest = new LoginRequest("existing_student_alex", "Alex@Pass1234", "STUDENT");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("accessToken").asText();

        mockMvc.perform(get("/api/v1/students/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("alex.student@institution.edu"));
    }

    @Test
    @DisplayName("Ambiguous cross-role mapping fails safely with conflict exception")
    void testAmbiguousCrossRoleMappingFailsSafely() throws Exception {
        String adminToken = getAdminToken();

        // Pre-create faculty account
        AppUser facultyUser = new AppUser(
                "prof_einstein",
                passwordEncoder.encode("Einstein@1234"),
                "albert.einstein@institution.edu",
                Role.FACULTY,
                true
        );
        userRepository.save(facultyUser);

        // Attempt to enroll student with the faculty email
        StudentRequestDto request = new StudentRequestDto();
        request.setFirstName("Albert");
        request.setLastName("Einstein");
        request.setEmail("albert.einstein@institution.edu");
        request.setPhone("+1777888999");
        request.setDateOfBirth(LocalDate.of(2004, 3, 14));
        request.setGender("MALE");
        request.setDepartment("Civil Engineering");
        request.setBatch("2024-2028");
        request.setEnrollmentDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());

        // Ensure no student was saved
        assertThat(studentRepository.findByEmail("albert.einstein@institution.edu")).isEmpty();
    }

    @Test
    @DisplayName("Cross-student and cross-ward access is strictly denied (403 Forbidden)")
    void testCrossStudentAndCrossWardAccessDenied() throws Exception {
        String adminToken = getAdminToken();

        // Enrol Student 1
        StudentRequestDto s1Req = new StudentRequestDto();
        s1Req.setFirstName("Student");
        s1Req.setLastName("One");
        s1Req.setEmail("student.one@institution.edu");
        s1Req.setPhone("+1000000001");
        s1Req.setDateOfBirth(LocalDate.of(2004, 1, 1));
        s1Req.setGender("MALE");
        s1Req.setDepartment("Computer Science");
        s1Req.setBatch("2024-2028");
        s1Req.setEnrollmentDate(LocalDate.now());

        MvcResult s1Res = mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(s1Req)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode s1Json = objectMapper.readTree(s1Res.getResponse().getContentAsString());
        Long s1Id = s1Json.path("data").path("id").asLong();
        String s1User = s1Json.path("data").path("username").asText();
        String s1Pass = s1Json.path("data").path("temporaryPassword").asText();

        // Enrol Student 2 with Parent 2
        GuardianRequestDto p2Req = new GuardianRequestDto();
        p2Req.setFirstName("Parent");
        p2Req.setLastName("Two");
        p2Req.setRelation("FATHER");
        p2Req.setPhone("+1000000002");
        p2Req.setEmail("parent.two@parent.org");

        StudentRequestDto s2Req = new StudentRequestDto();
        s2Req.setFirstName("Student");
        s2Req.setLastName("Two");
        s2Req.setEmail("student.two@institution.edu");
        s2Req.setPhone("+1000000003");
        s2Req.setDateOfBirth(LocalDate.of(2004, 2, 2));
        s2Req.setGender("FEMALE");
        s2Req.setDepartment("Computer Science");
        s2Req.setBatch("2024-2028");
        s2Req.setEnrollmentDate(LocalDate.now());
        s2Req.setGuardian(p2Req);

        MvcResult s2Res = mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(s2Req)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode s2Json = objectMapper.readTree(s2Res.getResponse().getContentAsString());
        Long s2Id = s2Json.path("data").path("id").asLong();
        Long p2GuardianId = s2Json.path("data").path("guardians").get(0).path("id").asLong();

        // Log in as Student 1
        MvcResult s1Login = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(s1User, s1Pass, "STUDENT"))))
                .andExpect(status().isOk())
                .andReturn();
        String s1Token = objectMapper.readTree(s1Login.getResponse().getContentAsString()).path("accessToken").asText();

        // Student 1 accesses Student 1 -> 200 OK
        mockMvc.perform(get("/api/v1/students/" + s1Id)
                        .header("Authorization", "Bearer " + s1Token))
                .andExpect(status().isOk());

        // Student 1 attempts to access Student 2 -> 403 Forbidden
        mockMvc.perform(get("/api/v1/students/" + s2Id)
                        .header("Authorization", "Bearer " + s1Token))
                .andExpect(status().isForbidden());

        // Student 1 attempts to access Parent 2 guardian info -> 403 Forbidden
        mockMvc.perform(get("/api/v1/guardians/" + p2GuardianId)
                        .header("Authorization", "Bearer " + s1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Email-only matching does NOT grant guardian access without verified userId link")
    void testEmailOnlyMatchDeniedWithoutUserIdLink() throws Exception {
        String adminToken = getAdminToken();

        // Enrol target student with a guardian record having email "target.parent@mail.com", but userId is NOT set yet
        StudentRequestDto sReq = new StudentRequestDto();
        sReq.setFirstName("Target");
        sReq.setLastName("Student");
        sReq.setEmail("target.student@institution.edu");
        sReq.setPhone("+1888000111");
        sReq.setDateOfBirth(LocalDate.of(2004, 5, 5));
        sReq.setGender("MALE");
        sReq.setDepartment("Computer Science");
        sReq.setBatch("2024-2028");
        sReq.setEnrollmentDate(LocalDate.now());

        MvcResult sRes = mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sReq)))
                .andExpect(status().isCreated())
                .andReturn();
        Long studentId = objectMapper.readTree(sRes.getResponse().getContentAsString()).path("data").path("id").asLong();
        Student student = studentRepository.findById(studentId).get();

        // Manually save an unlinked guardian record (userId = null) with email "target.parent@mail.com"
        Guardian unlinkedGuardian = new Guardian("Target", "Parent", "FATHER", "+1888000222", "target.parent@mail.com");
        unlinkedGuardian.setStudent(student);
        unlinkedGuardian.setUserId(null); // Explicitly unlinked
        guardianRepository.save(unlinkedGuardian);

        // Attacker creates a PARENT user account with "target.parent@mail.com"
        AppUser attackerUser = new AppUser(
                "attacker_parent",
                passwordEncoder.encode("Attacker@Pass123"),
                "target.parent@mail.com",
                Role.PARENT,
                true
        );
        userRepository.save(attackerUser);

        // Attacker logs in
        LoginRequest loginReq = new LoginRequest("attacker_parent", "Attacker@Pass123", "PARENT");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();
        String attackerToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("accessToken").asText();

        // Attacker attempts to access the student record simply because emails match -> MUST BE DENIED!
        mockMvc.perform(get("/api/v1/students/" + studentId)
                        .header("Authorization", "Bearer " + attackerToken))
                .andExpect(status().isForbidden());
    }
}
