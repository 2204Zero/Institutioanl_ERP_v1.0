package com.erp.finance.service;

import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import com.erp.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StudentFeeService {
    private final StudentFeeRepository studentFeeRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;

    public StudentFeeService(StudentFeeRepository studentFeeRepository,
                             FeeStructureRepository feeStructureRepository,
                             StudentRepository studentRepository,
                             AcademicYearRepository academicYearRepository) {
        this.studentFeeRepository = studentFeeRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
    }

    @Transactional
    public StudentFee assignFeeStructure(Long studentId, Long feeStructureId, Long academicYearId) {
        if (studentId == null || !studentRepository.existsById(studentId)) {
            throw new IllegalArgumentException("Student not found");
        }

        if (feeStructureId == null) {
            throw new IllegalArgumentException("Fee structure ID cannot be null");
        }

        FeeStructure structure = feeStructureRepository.findById(feeStructureId)
                .orElseThrow(() -> new IllegalArgumentException("Fee structure not found"));
                
        if (!Boolean.TRUE.equals(structure.getActive())) {
            throw new IllegalArgumentException("Cannot assign inactive fee structure");
        }

        if (academicYearId == null || !academicYearRepository.existsById(academicYearId)) {
            throw new IllegalArgumentException("Academic year not found");
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

    public StudentFee getById(Long id) {
        return studentFeeRepository.findById(id)
                .orElseThrow(() -> new com.erp.common.exception.ResourceNotFoundException("StudentFee", "id", id));
    }
}

