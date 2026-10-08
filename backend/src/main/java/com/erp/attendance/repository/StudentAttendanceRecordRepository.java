package com.erp.attendance.repository;

import com.erp.attendance.entity.StudentAttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StudentAttendanceRecordRepository extends JpaRepository<StudentAttendanceRecord, Long> {

    List<StudentAttendanceRecord> findByScheduleIdAndAttendanceDate(Long scheduleId, LocalDate attendanceDate);

    List<StudentAttendanceRecord> findByStudentId(Long studentId);
    
    @Query("SELECT r FROM StudentAttendanceRecord r WHERE r.scheduleId IN :scheduleIds AND r.attendanceDate = :attendanceDate")
    List<StudentAttendanceRecord> findByScheduleIdsAndAttendanceDate(@Param("scheduleIds") List<Long> scheduleIds, @Param("attendanceDate") LocalDate attendanceDate);

    boolean existsByStudentIdAndScheduleIdAndAttendanceDate(Long studentId, Long scheduleId, LocalDate attendanceDate);
}
