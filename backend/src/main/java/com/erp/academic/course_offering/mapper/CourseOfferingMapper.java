package com.erp.academic.course_offering.mapper;

import com.erp.academic.course_offering.dto.CourseOfferingResponse;
import com.erp.academic.course_offering.entity.CourseOffering;
import org.springframework.stereotype.Component;

@Component
public class CourseOfferingMapper {

    public CourseOfferingResponse toResponse(CourseOffering offering) {
        if (offering == null) {
            return null;
        }

        CourseOfferingResponse.CourseSummary courseSummary = null;
        if (offering.getCourse() != null) {
            courseSummary = CourseOfferingResponse.CourseSummary.builder()
                    .id(offering.getCourse().getId())
                    .code(offering.getCourse().getCode())
                    .name(offering.getCourse().getName())
                    .credits(offering.getCourse().getCredits())
                    .build();
        }

        CourseOfferingResponse.SemesterSummary semesterSummary = null;
        if (offering.getSemester() != null) {
            semesterSummary = CourseOfferingResponse.SemesterSummary.builder()
                    .id(offering.getSemester().getId())
                    .name(offering.getSemester().getName())
                    .semesterNumber(offering.getSemester().getSemesterNumber())
                    .isActive(offering.getSemester().getIsActive())
                    .build();
        }

        return CourseOfferingResponse.builder()
                .id(offering.getId())
                .courseId(offering.getCourse() != null ? offering.getCourse().getId() : null)
                .courseCode(offering.getCourse() != null ? offering.getCourse().getCode() : null)
                .courseName(offering.getCourse() != null ? offering.getCourse().getName() : null)
                .semesterId(offering.getSemester() != null ? offering.getSemester().getId() : null)
                .semesterName(offering.getSemester() != null ? offering.getSemester().getName() : null)
                .maxCapacity(offering.getMaxCapacity())
                .isPublished(offering.getIsPublished())
                .course(courseSummary)
                .semester(semesterSummary)
                .build();
    }
}
