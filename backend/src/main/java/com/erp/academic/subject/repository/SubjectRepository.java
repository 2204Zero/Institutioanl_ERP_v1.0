package com.erp.academic.subject.repository;

import com.erp.academic.subject.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<Subject> findByCourseId(Long courseId);

    List<Subject> findByDepartmentId(Long departmentId);

    @Query("SELECT s FROM Subject s WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:departmentId IS NULL OR s.departmentId = :departmentId) AND " +
           "(:courseId IS NULL OR s.courseId = :courseId) AND " +
           "(:programId IS NULL OR s.programId = :programId) AND " +
           "(:isPractical IS NULL OR s.isPractical = :isPractical) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive) " +
           "ORDER BY s.code ASC")
    List<Subject> searchAndFilter(@Param("search") String search,
                                  @Param("departmentId") Long departmentId,
                                  @Param("courseId") Long courseId,
                                  @Param("programId") Long programId,
                                  @Param("isPractical") Boolean isPractical,
                                  @Param("isActive") Boolean isActive);
}
