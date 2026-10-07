package com.erp.academic.section.repository;

import com.erp.academic.section.entity.SectionFaculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionFacultyRepository extends JpaRepository<SectionFaculty, Long> {

    List<SectionFaculty> findBySectionId(Long sectionId);

    List<SectionFaculty> findByFacultyId(Long facultyId);

    boolean existsBySectionIdAndFacultyIdAndSubjectId(Long sectionId, Long facultyId, Long subjectId);

    void deleteBySectionId(Long sectionId);
}
