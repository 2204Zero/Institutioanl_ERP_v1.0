package com.erp.finance.scholarship.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity
@Table(name = "finance_scholarship")
public class Scholarship {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String type; // FIXED, PERCENTAGE
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal value;
    private String eligibility;
    private Boolean active = true;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getType() { return type; } public void setType(String type) { this.type = type; }
    public BigDecimal getValue() { return value; } public void setValue(BigDecimal value) { this.value = value; }
    public String getEligibility() { return eligibility; } public void setEligibility(String eligibility) { this.eligibility = eligibility; }
    public Boolean getActive() { return active; } public void setActive(Boolean active) { this.active = active; }
}
