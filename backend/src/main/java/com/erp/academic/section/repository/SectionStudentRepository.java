package com.erp.academic.section.repository;

import com.erp.academic.section.entity.SectionStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionStudentRepository extends JpaRepository<SectionStudent, Long> {

    List<SectionStudent> findBySectionId(Long sectionId);

    List<SectionStudent> findBySectionIdAndIsActiveTrue(Long sectionId);

    Optional<SectionStudent> findBySectionIdAndStudentId(Long sectionId, Long studentId);

    boolean existsBySectionIdAndStudentIdAndIsActiveTrue(Long sectionId, Long studentId);

    int countBySectionIdAndIsActiveTrue(Long sectionId);

    void deleteBySectionId(Long sectionId);
}
