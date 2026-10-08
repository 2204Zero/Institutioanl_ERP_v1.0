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

@Service
public class FacultyService {

    private final FacultyIdentityService identityService;
    private final SectionRepository sectionRepository;
    private final SectionMapper sectionMapper;
    private final TimetableSlotRepository timetableSlotRepository;

    public FacultyService(
            FacultyIdentityService identityService, 
            SectionRepository sectionRepository,
            SectionMapper sectionMapper,
            TimetableSlotRepository timetableSlotRepository) {
        this.identityService = identityService;
        this.sectionRepository = sectionRepository;
        this.sectionMapper = sectionMapper;
        this.timetableSlotRepository = timetableSlotRepository;
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
