package com.erp.finance.dto;

import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.student_fee.entity.StudentFee;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class StudentFeeResponseDto {
    private Long id;
    private Long studentId;
    private Long academicYearId;
    private Long feeStructureId;
    private BigDecimal grossAmount;
    private BigDecimal scholarshipAmount;
    private BigDecimal concessionAmount;
    private BigDecimal netPayable;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private StudentFeeStatus status;
    private List<StudentFeeComponentResponseDto> components;
    private Instant createdAt;
    private Instant updatedAt;

    public StudentFeeResponseDto() {}

    public static StudentFeeResponseDto fromEntity(StudentFee fee) {
        if (fee == null) return null;
        StudentFeeResponseDto dto = new StudentFeeResponseDto();
        dto.setId(fee.getId());
        dto.setStudentId(fee.getStudentId());
        dto.setAcademicYearId(fee.getAcademicYearId());
        dto.setFeeStructureId(fee.getFeeStructureId());
        dto.setGrossAmount(fee.getGrossAmount());
        dto.setScholarshipAmount(fee.getScholarshipAmount());
        dto.setConcessionAmount(fee.getConcessionAmount());
        dto.setNetPayable(fee.getNetPayable());
        dto.setPaidAmount(fee.getPaidAmount());
        dto.setOutstandingAmount(fee.getOutstandingAmount());
        dto.setStatus(fee.getStatus());
        dto.setCreatedAt(fee.getCreatedAt());
        dto.setUpdatedAt(fee.getUpdatedAt());
        if (fee.getComponents() != null) {
            dto.setComponents(fee.getComponents().stream()
                    .map(StudentFeeComponentResponseDto::fromEntity)
                    .collect(Collectors.toList()));
        } else {
            dto.setComponents(Collections.emptyList());
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }

    public Long getFeeStructureId() { return feeStructureId; }
    public void setFeeStructureId(Long feeStructureId) { this.feeStructureId = feeStructureId; }

    public BigDecimal getGrossAmount() { return grossAmount; }
    public void setGrossAmount(BigDecimal grossAmount) { this.grossAmount = grossAmount; }

    public BigDecimal getScholarshipAmount() { return scholarshipAmount; }
    public void setScholarshipAmount(BigDecimal scholarshipAmount) { this.scholarshipAmount = scholarshipAmount; }

    public BigDecimal getConcessionAmount() { return concessionAmount; }
    public void setConcessionAmount(BigDecimal concessionAmount) { this.concessionAmount = concessionAmount; }

    public BigDecimal getNetPayable() { return netPayable; }
    public void setNetPayable(BigDecimal netPayable) { this.netPayable = netPayable; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }

    public BigDecimal getTotalAmount() { return netPayable != null ? netPayable : grossAmount; }

    public StudentFeeStatus getStatus() { return status; }
    public void setStatus(StudentFeeStatus status) { this.status = status; }

    public List<StudentFeeComponentResponseDto> getComponents() { return components; }
    public void setComponents(List<StudentFeeComponentResponseDto> components) { this.components = components; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
