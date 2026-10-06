package com.erp.academic.section.repository;

import com.erp.academic.section.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByCourseOfferingId(Long courseOfferingId);

    @Query("SELECT s FROM Section s WHERE " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:courseOfferingId IS NULL OR s.courseOffering.id = :courseOfferingId) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive)")
    List<Section> searchAndFilter(
            @Param("search") String search, 
            @Param("courseOfferingId") Long courseOfferingId, 
            @Param("isActive") Boolean isActive);
}
