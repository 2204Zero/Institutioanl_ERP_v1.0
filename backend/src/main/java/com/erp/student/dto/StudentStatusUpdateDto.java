package com.erp.student.dto;

import com.erp.student.entity.StudentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for updating student enrollment status")
public class StudentStatusUpdateDto {

    @Schema(description = "New student status", example = "SUSPENDED")
    @NotNull(message = "Status cannot be null")
    private StudentStatus status;

    @Schema(description = "Reason or remarks for the status change", example = "Disciplinary suspension pending review")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    @Schema(description = "User or administrator making the change", example = "admin_user")
    private String changedBy;

    @Schema(description = "Effective date of the status change", example = "2026-09-14")
    @NotNull(message = "Effective date cannot be null")
    private java.time.LocalDate effectiveDate;

    public StudentStatusUpdateDto() {
    }

    public StudentStatusUpdateDto(StudentStatus status, String reason, String changedBy, java.time.LocalDate effectiveDate) {
        this.status = status;
        this.reason = reason;
        this.changedBy = changedBy;
        this.effectiveDate = effectiveDate;
    }

    public StudentStatus getStatus() {
        return status;
    }

    public void setStatus(StudentStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public java.time.LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(java.time.LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
}
