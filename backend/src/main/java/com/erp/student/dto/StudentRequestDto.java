package com.erp.student.dto;

import com.erp.student.entity.StudentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Schema(description = "Request payload for creating or updating a student")
public class StudentRequestDto {

    @Schema(description = "Unique roll number", example = "2026-CS-101")
    @NotBlank(message = "Roll number is required")
    @Size(max = 50, message = "Roll number cannot exceed 50 characters")
    private String rollNumber;

    @Schema(description = "First name", example = "Aarav")
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @Schema(description = "Last name", example = "Sharma")
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @Schema(description = "Institutional or personal email", example = "aarav.sharma@college.edu")
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @Schema(description = "Contact phone number", example = "+919876543210")
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,20}$", message = "Phone number must be between 10 and 20 digits")
    private String phone;

    @Schema(description = "Date of Birth", example = "2005-06-15")
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Schema(description = "Gender", example = "MALE")
    @NotBlank(message = "Gender is required")
    private String gender;

    @Schema(description = "Blood group", example = "O+")
    private String bloodGroup;

    @Schema(description = "Permanent address", example = "Flat 402, Sunshine Heights")
    private String address;

    @Schema(description = "City", example = "New Delhi")
    private String city;

    @Schema(description = "State", example = "Delhi")
    private String state;

    @Schema(description = "Postal code", example = "110001")
    private String pincode;

    @Schema(description = "Academic department", example = "Computer Science and Engineering")
    @NotBlank(message = "Department is required")
    private String department;

    @Schema(description = "Degree program", example = "B.Tech Computer Science")
    private String program;

    @Schema(description = "Academic batch", example = "2023-2027")
    @NotBlank(message = "Batch is required")
    private String batch;

    @Schema(description = "Enrollment date", example = "2023-08-01")
    @NotNull(message = "Enrollment date is required")
    private LocalDate enrollmentDate;

    @Schema(description = "Initial status (defaults to ACTIVE)", example = "ACTIVE")
    private StudentStatus status = StudentStatus.ACTIVE;

    public StudentRequestDto() {
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public StudentStatus getStatus() {
        return status;
    }

    public void setStatus(StudentStatus status) {
        this.status = status;
    }
}
