package com.erp.student.service;

import com.erp.common.response.PageResponse;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.dto.StudentResponseDto;
import com.erp.student.dto.StudentStatusUpdateDto;
import com.erp.student.entity.StudentStatus;
import com.erp.student.entity.StudentStatusHistory;

import java.util.List;

public interface StudentService {

    StudentResponseDto createStudent(StudentRequestDto requestDto);

    StudentResponseDto getStudentById(Long id);

    StudentResponseDto getStudentByRollNumber(String rollNumber);

    PageResponse<StudentResponseDto> getAllStudents(int page, int size, String query,
                                                   StudentStatus status, String department,
                                                   String sortBy, String sortDir);

    StudentResponseDto updateStudent(Long id, StudentRequestDto requestDto);

    void deleteStudent(Long id);

    StudentResponseDto updateStudentStatus(Long id, StudentStatusUpdateDto statusUpdateDto);

    List<StudentStatusHistory> getStatusHistory(Long studentId);
}
