package com.erp.academic.facade.service;

import com.erp.academic.course.entity.CoursePrerequisite;
import com.erp.academic.course.repository.CoursePrerequisiteRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.facade.dto.OfferingTreeDto;
import com.erp.academic.facade.dto.SectionDto;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicQueryService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CoursePrerequisiteRepository prerequisiteRepository;
    private final SectionRepository sectionRepository;

    @Transactional(readOnly = true)
    public List<OfferingTreeDto> getOfferingsTreeForSemester(Long semesterId) {
        List<CourseOffering> offerings = courseOfferingRepository.findBySemesterId(semesterId);

        return offerings.stream().map(offering -> {
            List<Long> prereqs = prerequisiteRepository.findByCourseId(offering.getCourse().getId())
                    .stream()
                    .map(cp -> cp.getPrerequisiteCourse().getId())
                    .collect(Collectors.toList());

            List<SectionDto> sectionDtos = sectionRepository.findByCourseOfferingId(offering.getId())
                    .stream()
                    .map(sec -> SectionDto.builder()
                            .sectionId(sec.getId())
                            .sectionName(sec.getName())
                            .capacity(sec.getCapacity())
                            .currentEnrollment(sec.getCurrentEnrollment())
                            .isFull(sec.getCurrentEnrollment() >= sec.getCapacity())
                            .build())
                    .collect(Collectors.toList());

            return OfferingTreeDto.builder()
                    .courseOfferingId(offering.getId())
                    .courseId(offering.getCourse().getId())
                    .courseName(offering.getCourse().getName())
                    .credits(offering.getCourse().getCredits())
                    .semesterId(offering.getSemester().getId())
                    .semesterName(offering.getSemester().getName())
                    .prerequisiteCourseIds(prereqs)
                    .sections(sectionDtos)
                    .build();
        }).collect(Collectors.toList());
    }
}
