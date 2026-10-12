package com.erp.finance.dto;

import java.math.BigDecimal;

public class FinanceSummaryResponseDto {
    private BigDecimal totalGrossAssigned;
    private BigDecimal totalCollected;
    private BigDecimal totalOutstanding;

    public FinanceSummaryResponseDto() {}

    public FinanceSummaryResponseDto(BigDecimal totalGrossAssigned, BigDecimal totalCollected, BigDecimal totalOutstanding) {
        this.totalGrossAssigned = totalGrossAssigned;
        this.totalCollected = totalCollected;
        this.totalOutstanding = totalOutstanding;
    }

    public BigDecimal getTotalGrossAssigned() { return totalGrossAssigned; }
    public void setTotalGrossAssigned(BigDecimal totalGrossAssigned) { this.totalGrossAssigned = totalGrossAssigned; }

    public BigDecimal getTotalCollected() { return totalCollected; }
    public void setTotalCollected(BigDecimal totalCollected) { this.totalCollected = totalCollected; }

    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
}
