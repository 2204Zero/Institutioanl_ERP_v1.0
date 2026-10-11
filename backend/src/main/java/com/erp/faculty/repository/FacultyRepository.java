package com.erp.faculty.repository;

import com.erp.faculty.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByOfficialEmailIgnoreCase(String officialEmail);
    boolean existsByOfficialEmailIgnoreCase(String officialEmail);
    Optional<Faculty> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
