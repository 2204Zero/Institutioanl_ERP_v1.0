package com.erp.finance.fee_structure.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "fee_structure_component", uniqueConstraints = {@UniqueConstraint(columnNames = {"fee_structure_id", "fee_head_id"})})
public class FeeStructureComponent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fee_structure_id", nullable = false) private FeeStructure feeStructure;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fee_head_id", nullable = false) private FeeHead feeHead;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public FeeStructure getFeeStructure() { return feeStructure; } public void setFeeStructure(FeeStructure feeStructure) { this.feeStructure = feeStructure; }
    public FeeHead getFeeHead() { return feeHead; } public void setFeeHead(FeeHead feeHead) { this.feeHead = feeHead; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
}
