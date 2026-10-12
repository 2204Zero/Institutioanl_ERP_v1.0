package com.erp.finance.dto;

import com.erp.finance.fee_structure.entity.FeeStructure;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class FeeStructureResponseDto {
    private Long id;
    private String code;
    private String name;
    private Long academicYearId;
    private Long programId;
    private Boolean active;
    private List<FeeStructureComponentResponseDto> components;

    public FeeStructureResponseDto() {}

    public static FeeStructureResponseDto fromEntity(FeeStructure feeStructure) {
        if (feeStructure == null) return null;
        FeeStructureResponseDto dto = new FeeStructureResponseDto();
        dto.setId(feeStructure.getId());
        dto.setCode(feeStructure.getCode());
        dto.setName(feeStructure.getName());
        dto.setAcademicYearId(feeStructure.getAcademicYearId());
        dto.setProgramId(feeStructure.getProgramId());
        dto.setActive(feeStructure.getActive());
        if (feeStructure.getComponents() != null) {
            dto.setComponents(feeStructure.getComponents().stream()
                    .map(FeeStructureComponentResponseDto::fromEntity)
                    .collect(Collectors.toList()));
        } else {
            dto.setComponents(Collections.emptyList());
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }

    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public List<FeeStructureComponentResponseDto> getComponents() { return components; }
    public void setComponents(List<FeeStructureComponentResponseDto> components) { this.components = components; }
}
