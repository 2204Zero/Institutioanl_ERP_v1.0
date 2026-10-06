package com.erp.academic.course.repository;

import com.erp.academic.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT c FROM Course c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:departmentId IS NULL OR c.departmentId = :departmentId) AND " +
           "(:programId IS NULL OR c.programId = :programId) AND " +
           "(:courseType IS NULL OR :courseType = '' OR LOWER(c.courseType) = LOWER(:courseType)) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive) " +
           "ORDER BY c.code ASC")
    List<Course> searchAndFilter(@Param("search") String search,
                                 @Param("departmentId") Long departmentId,
                                 @Param("programId") Long programId,
                                 @Param("courseType") String courseType,
                                 @Param("isActive") Boolean isActive);
}
