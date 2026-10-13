package com.erp.finance.service;

import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FeeStructureService {
    private final FeeStructureRepository feeStructureRepository;
    private final FeeHeadRepository feeHeadRepository;

    public FeeStructureService(FeeStructureRepository feeStructureRepository, FeeHeadRepository feeHeadRepository) {
        this.feeStructureRepository = feeStructureRepository;
        this.feeHeadRepository = feeHeadRepository;
    }

    @Transactional
    public FeeStructure createFeeStructure(FeeStructure feeStructure) {
        if (feeStructure.getCode() == null || feeStructure.getCode().isEmpty()) {
            feeStructure.setCode("FS-" + System.currentTimeMillis());
        }
        return feeStructureRepository.save(feeStructure);
    }

    @Transactional
    public FeeStructure addComponent(Long structureId, Long headId, java.math.BigDecimal amount) {
        FeeStructure structure = feeStructureRepository.findById(structureId)
                .orElseThrow(() -> new IllegalArgumentException("Fee structure not found"));
        FeeHead head = feeHeadRepository.findById(headId)
                .orElseThrow(() -> new IllegalArgumentException("Fee head not found"));
                
        // Validation: no negative amount, no duplicate component
        if (amount.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        boolean exists = structure.getComponents().stream()
                .anyMatch(c -> c.getFeeHead().getId().equals(headId));
        if (exists) {
            throw new IllegalArgumentException("Component already exists in this structure");
        }

        FeeStructureComponent comp = new FeeStructureComponent();
        comp.setFeeStructure(structure);
        comp.setFeeHead(head);
        comp.setAmount(amount);
        structure.getComponents().add(comp);
        
        return feeStructureRepository.save(structure);
    }
    
    public FeeStructure getById(Long id) {
        return feeStructureRepository.findById(id)
                .orElseThrow(() -> new com.erp.common.exception.ResourceNotFoundException("FeeStructure", "id", id));
    }

    @Transactional
    public FeeStructure updateFeeStructure(Long id, FeeStructure updated) {
        FeeStructure structure = getById(id);
        if (updated.getName() != null && !updated.getName().isBlank()) {
            structure.setName(updated.getName());
        }
        if (updated.getCode() != null && !updated.getCode().isBlank()) {
            structure.setCode(updated.getCode());
        }
        if (updated.getAcademicYearId() != null) {
            structure.setAcademicYearId(updated.getAcademicYearId());
        }
        if (updated.getProgramId() != null) {
            structure.setProgramId(updated.getProgramId());
        }
        if (updated.getActive() != null) {
            structure.setActive(updated.getActive());
        }
        return feeStructureRepository.save(structure);
    }

    @Transactional
    public FeeStructure approveFeeStructure(Long id) {
        FeeStructure structure = getById(id);
        structure.setActive(true);
        return feeStructureRepository.save(structure);
    }

    public List<FeeStructure> getAll() {
        return feeStructureRepository.findAll();
    }
}
