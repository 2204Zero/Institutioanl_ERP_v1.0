package com.erp.finance.fee_structure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "fee_structure")
public class FeeStructure {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String code;
    @Column(nullable = false) private String name;
    private Long academicYearId;
    private Long programId;
    private Boolean active = true;
    @OneToMany(mappedBy = "feeStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeeStructureComponent> components = new ArrayList<>();
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public Long getAcademicYearId() { return academicYearId; } public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public Long getProgramId() { return programId; } public void setProgramId(Long programId) { this.programId = programId; }
    public Boolean getActive() { return active; } public void setActive(Boolean active) { this.active = active; }
    public List<FeeStructureComponent> getComponents() { return components; } public void setComponents(List<FeeStructureComponent> components) { this.components = components; }
}
