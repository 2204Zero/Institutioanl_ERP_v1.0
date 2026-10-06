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
        return feeStructureRepository.save(feeStructure);
    }

    @Transactional
    public FeeStructure addComponent(Long structureId, Long headId, java.math.BigDecimal amount) {
        FeeStructure structure = feeStructureRepository.findById(structureId)
                .orElseThrow(() -> new RuntimeException("Fee structure not found"));
        FeeHead head = feeHeadRepository.findById(headId)
                .orElseThrow(() -> new RuntimeException("Fee head not found"));
                
        // Validation: no negative amount, no duplicate component
        if (amount.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Amount cannot be negative");
        }
        boolean exists = structure.getComponents().stream()
                .anyMatch(c -> c.getFeeHead().getId().equals(headId));
        if (exists) {
            throw new RuntimeException("Component already exists in this structure");
        }

        FeeStructureComponent comp = new FeeStructureComponent();
        comp.setFeeStructure(structure);
        comp.setFeeHead(head);
        comp.setAmount(amount);
        structure.getComponents().add(comp);
        
        return feeStructureRepository.save(structure);
    }
    
    public List<FeeStructure> getAll() {
        return feeStructureRepository.findAll();
    }
}
