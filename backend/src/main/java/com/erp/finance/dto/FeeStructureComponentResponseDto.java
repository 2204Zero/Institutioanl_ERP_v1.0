package com.erp.finance.dto;

import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import java.math.BigDecimal;

public class FeeStructureComponentResponseDto {
    private Long id;
    private Long feeHeadId;
    private String feeHeadCode;
    private String feeHeadName;
    private BigDecimal amount;

    public FeeStructureComponentResponseDto() {}

    public static FeeStructureComponentResponseDto fromEntity(FeeStructureComponent component) {
        if (component == null) return null;
        FeeStructureComponentResponseDto dto = new FeeStructureComponentResponseDto();
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
        dto.setAmount(component.getAmount());
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

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
