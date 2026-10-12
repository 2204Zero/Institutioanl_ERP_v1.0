package com.erp.finance.dto;

import com.erp.finance.student_fee.entity.StudentFeeComponent;
import java.math.BigDecimal;

public class StudentFeeComponentResponseDto {
    private Long id;
    private Long feeHeadId;
    private String feeHeadCode;
    private String feeHeadName;
    private BigDecimal grossAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;

    public StudentFeeComponentResponseDto() {}

    public static StudentFeeComponentResponseDto fromEntity(StudentFeeComponent component) {
        if (component == null) return null;
        StudentFeeComponentResponseDto dto = new StudentFeeComponentResponseDto();
        dto.setId(component.getId());
        if (component.getFeeHead() != null) {
            try {
                dto.setFeeHeadId(component.getFeeHead().getId());
                if (org.hibernate.Hibernate.isInitialized(component.getFeeHead())) {
                    dto.setFeeHeadCode(component.getFeeHead().getCode());
                    dto.setFeeHeadName(component.getFeeHead().getName());
                }
            } catch (Exception ignored) {
                // Safely handle uninitialized lazy proxy
            }
        }
        dto.setGrossAmount(component.getGrossAmount());
        dto.setPaidAmount(component.getPaidAmount());
        dto.setOutstandingAmount(component.getOutstandingAmount());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFeeHeadId() { return feeHeadId; }
    public void setFeeHeadId(Long feeHeadId) { this.feeHeadId = feeHeadId; }

    public String getFeeHeadCode() { return feeHeadCode; }
    public void setFeeHeadCode(String feeHeadCode) { this.feeHeadCode = feeHeadCode; }

    public String getFeeHeadName() { return feeHeadName; }
    public void setFeeHeadName(String feeHeadName) { this.feeHeadName = feeHeadName; }

    public BigDecimal getGrossAmount() { return grossAmount; }
    public void setGrossAmount(BigDecimal grossAmount) { this.grossAmount = grossAmount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }
}
