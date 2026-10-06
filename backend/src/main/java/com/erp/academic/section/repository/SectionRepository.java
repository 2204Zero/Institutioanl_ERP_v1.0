package com.erp.academic.section.repository;

import com.erp.academic.section.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByBatchId(Long batchId);

    List<Section> findBySemesterId(Long semesterId);

    List<Section> findByBatchIdAndSemesterId(Long batchId, Long semesterId);

    @Query("SELECT s FROM Section s WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:batchId IS NULL OR s.batchId = :batchId) AND " +
           "(:semesterId IS NULL OR s.semesterId = :semesterId) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive) " +
           "ORDER BY s.name ASC")
    List<Section> searchAndFilter(@Param("search") String search,
                                  @Param("batchId") Long batchId,
                                  @Param("semesterId") Long semesterId,
                                  @Param("isActive") Boolean isActive);
}
