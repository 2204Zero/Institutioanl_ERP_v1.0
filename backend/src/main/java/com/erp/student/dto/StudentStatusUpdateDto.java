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

    public StudentStatusUpdateDto() {
    }

    public StudentStatusUpdateDto(StudentStatus status, String reason, String changedBy) {
        this.status = status;
        this.reason = reason;
        this.changedBy = changedBy;
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
}
