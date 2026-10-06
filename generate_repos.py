import os
base_dir = "backend/src/main/java/com/erp/finance"
def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")

write_file("fee_structure/repository/FeeHeadRepository.java", '''
package com.erp.finance.fee_structure.repository;
import com.erp.finance.fee_structure.entity.FeeHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface FeeHeadRepository extends JpaRepository<FeeHead, Long> {
    Optional<FeeHead> findByCode(String code);
}
''')

write_file("fee_structure/repository/FeeStructureRepository.java", '''
package com.erp.finance.fee_structure.repository;
import com.erp.finance.fee_structure.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    Optional<FeeStructure> findByCode(String code);
    Optional<FeeStructure> findByProgramIdAndAcademicYearIdAndActiveTrue(Long programId, Long academicYearId);
}
''')

write_file("student_fee/repository/StudentFeeRepository.java", '''
package com.erp.finance.student_fee.repository;
import com.erp.finance.student_fee.entity.StudentFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {
    List<StudentFee> findByStudentId(Long studentId);
    Optional<StudentFee> findByStudentIdAndAcademicYearId(Long studentId, Long academicYearId);
}
''')

write_file("payment/repository/PaymentRepository.java", '''
package com.erp.finance.payment.repository;
import com.erp.finance.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStudentId(Long studentId);
    Optional<Payment> findByReferenceNumber(String referenceNumber);
}
''')

write_file("invoice/repository/ReceiptRepository.java", '''
package com.erp.finance.invoice.repository;
import com.erp.finance.invoice.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByReceiptNumber(String receiptNumber);
}
''')

print("Repositories generated.")
