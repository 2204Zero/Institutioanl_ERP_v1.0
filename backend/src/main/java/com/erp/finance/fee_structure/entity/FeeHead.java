package com.erp.finance.fee_structure.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name = "fee_head")
public class FeeHead {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String code;
    @Column(nullable = false) private String name;
    private String description;
    private Boolean active = true;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public Boolean getActive() { return active; } public void setActive(Boolean active) { this.active = active; }
}
