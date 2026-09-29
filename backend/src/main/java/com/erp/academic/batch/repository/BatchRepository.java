package com.erp.academic.batch.repository;

import com.erp.academic.batch.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<Batch> findByProgramId(Long programId);

    @Query("SELECT b FROM Batch b WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(b.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:programId IS NULL OR b.programId = :programId) AND " +
           "(:admissionYear IS NULL OR b.admissionYear = :admissionYear) AND " +
           "(:isActive IS NULL OR b.isActive = :isActive) " +
           "ORDER BY b.admissionYear DESC, b.name ASC")
    List<Batch> searchAndFilter(@Param("search") String search,
                                @Param("programId") Long programId,
                                @Param("admissionYear") Integer admissionYear,
                                @Param("isActive") Boolean isActive);
}
