package com.erp.faculty.service;

import com.erp.academic.section.dto.SectionResponse;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.mapper.SectionMapper;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.erp.faculty.dto.FacultyProfileResponse;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyIdentityService identityService;
    private final SectionRepository sectionRepository;
    private final SectionMapper sectionMapper;
    private final TimetableSlotRepository timetableSlotRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;

    public FacultyService(
            FacultyIdentityService identityService, 
            SectionRepository sectionRepository,
            SectionMapper sectionMapper,
            TimetableSlotRepository timetableSlotRepository,
            FacultyRepository facultyRepository,
            DepartmentRepository departmentRepository) {
        this.identityService = identityService;
        this.sectionRepository = sectionRepository;
        this.sectionMapper = sectionMapper;
        this.timetableSlotRepository = timetableSlotRepository;
        this.facultyRepository = facultyRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public FacultyProfileResponse getMyProfile() {
        Long facultyId = identityService.getCurrentFacultyId();
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty record not found with id: " + facultyId));
        String departmentName = null;
        if (faculty.getDepartmentId() != null) {
            departmentName = departmentRepository.findById(faculty.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }
        return new FacultyProfileResponse(
                faculty.getId(),
                faculty.getFirstName(),
                faculty.getLastName(),
                faculty.getOfficialEmail(),
                faculty.getDepartmentId(),
                departmentName,
                faculty.getUserId(),
                faculty.getIsActive()
        );
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> getMySections() {
        Long facultyId = identityService.getCurrentFacultyId();
        List<Section> sections = sectionRepository.findActiveSectionsByFacultyId(facultyId);
        return sections.stream().map(sectionMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getMyTimetable() {
        Long facultyId = identityService.getCurrentFacultyId();
        return timetableSlotRepository.findByFacultyIdAndIsActiveTrue(facultyId);
    }
}
