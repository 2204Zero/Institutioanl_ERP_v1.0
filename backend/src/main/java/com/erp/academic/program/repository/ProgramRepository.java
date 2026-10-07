package com.erp.academic.program.repository;

import com.erp.academic.program.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {

    Optional<Program> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT p FROM Program p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:departmentId IS NULL OR p.departmentId = :departmentId) AND " +
           "(:degree IS NULL OR :degree = '' OR LOWER(p.degree) = LOWER(:degree)) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive) " +
           "ORDER BY p.name ASC")
    List<Program> searchAndFilter(@Param("search") String search,
                                  @Param("departmentId") Long departmentId,
                                  @Param("degree") String degree,
                                  @Param("isActive") Boolean isActive);
}
