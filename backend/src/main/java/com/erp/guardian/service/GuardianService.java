package com.erp.guardian.service;

import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.dto.GuardianResponseDto;

import java.util.List;

public interface GuardianService {

    List<GuardianResponseDto> getAllGuardians();

    GuardianResponseDto getGuardianById(Long id);

    GuardianResponseDto createGuardian(GuardianRequestDto requestDto);

    GuardianResponseDto updateGuardian(Long id, GuardianRequestDto requestDto);

    void deleteGuardian(Long id);

    List<GuardianResponseDto> getGuardiansByStudentId(Long studentId);

    GuardianResponseDto addGuardianToStudent(Long studentId, GuardianRequestDto requestDto);

    GuardianResponseDto linkGuardianToStudent(Long studentId, Long guardianId);
}
