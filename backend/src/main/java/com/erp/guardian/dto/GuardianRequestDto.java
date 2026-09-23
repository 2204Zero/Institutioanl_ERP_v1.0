package com.erp.guardian.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for creating or updating a guardian")
public class GuardianRequestDto {

    @Schema(description = "Associated student ID (optional if linked via student endpoint)", example = "1")
    private Long studentId;

    @Schema(description = "First name", example = "Rajesh")
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @Schema(description = "Last name", example = "Sharma")
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @Schema(description = "Relation to student (e.g. FATHER, MOTHER, LEGAL_GUARDIAN)", example = "FATHER")
    @NotBlank(message = "Relation is required")
    private String relation;

    @Schema(description = "Contact phone number", example = "+919811223344")
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,20}$", message = "Phone number must be between 10 and 20 digits")
    private String phone;

    @Schema(description = "Email address", example = "rajesh.sharma@example.com")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(description = "Occupation", example = "Civil Engineer")
    private String occupation;

    @Schema(description = "Residential address", example = "Flat 402, Sunshine Heights")
    private String address;

    @Schema(description = "Mark as emergency contact", example = "true")
    private Boolean isEmergencyContact = false;

    public GuardianRequestDto() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
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

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getIsEmergencyContact() {
        return isEmergencyContact;
    }

    public void setIsEmergencyContact(Boolean emergencyContact) {
        isEmergencyContact = emergencyContact;
    }
}
