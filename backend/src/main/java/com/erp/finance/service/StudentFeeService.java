package com.erp.finance.service;

import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StudentFeeService {
    private final StudentFeeRepository studentFeeRepository;
    private final FeeStructureRepository feeStructureRepository;

    public StudentFeeService(StudentFeeRepository studentFeeRepository, FeeStructureRepository feeStructureRepository) {
        this.studentFeeRepository = studentFeeRepository;
        this.feeStructureRepository = feeStructureRepository;
    }

    @Transactional
    public StudentFee assignFeeStructure(Long studentId, Long feeStructureId, Long academicYearId) {
        FeeStructure structure = feeStructureRepository.findById(feeStructureId)
                .orElseThrow(() -> new IllegalArgumentException("Fee structure not found"));
                
        if (!structure.getActive()) {
            throw new IllegalArgumentException("Cannot assign inactive fee structure");
        }

        // Check for duplicates
        if (studentFeeRepository.findByStudentIdAndAcademicYearId(studentId, academicYearId).isPresent()) {
            throw new IllegalArgumentException("Student fee already assigned for this academic year");
        }

        StudentFee studentFee = new StudentFee();
        studentFee.setStudentId(studentId);
        studentFee.setAcademicYearId(academicYearId);
        studentFee.setFeeStructureId(feeStructureId);
        
        BigDecimal grossAmount = BigDecimal.ZERO;
        
        for (FeeStructureComponent fsc : structure.getComponents()) {
            StudentFeeComponent sfc = new StudentFeeComponent();
            sfc.setStudentFee(studentFee);
            sfc.setFeeHead(fsc.getFeeHead());
            sfc.setGrossAmount(fsc.getAmount());
            sfc.setOutstandingAmount(fsc.getAmount());
            studentFee.getComponents().add(sfc);
            
            grossAmount = grossAmount.add(fsc.getAmount());
        }
        
        studentFee.setGrossAmount(grossAmount);
        studentFee.setNetPayable(grossAmount); // Will be updated by ScholarshipService if applicable
        studentFee.setOutstandingAmount(grossAmount);
        studentFee.setStatus(StudentFeeStatus.PENDING);
        
        return studentFeeRepository.save(studentFee);
    }
    
    public List<StudentFee> getAllStudentFees() { return studentFeeRepository.findAll(); }

    public List<StudentFee> getStudentFees(Long studentId) {
        return studentFeeRepository.findByStudentId(studentId);
    }
}

