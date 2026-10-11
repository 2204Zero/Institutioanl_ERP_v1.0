package com.erp.academic.course_registration.mapper;

import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_registration.dto.CourseRegistrationResponse;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.section.entity.Section;
import com.erp.student.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class CourseRegistrationMapper {

    public CourseRegistrationResponse toResponse(CourseRegistration registration) {
        if (registration == null) {
            return null;
        }

        CourseRegistrationResponse.CourseOfferingSummary offeringSummary = null;
        CourseOffering offering = registration.getCourseOffering();
        if (offering != null) {
            CourseRegistrationResponse.CourseSummary courseSummary = null;
            if (offering.getCourse() != null) {
                courseSummary = CourseRegistrationResponse.CourseSummary.builder()
                        .id(offering.getCourse().getId())
                        .code(offering.getCourse().getCode())
                        .name(offering.getCourse().getName())
                        .credits(offering.getCourse().getCredits())
                        .build();
            }

            CourseRegistrationResponse.SemesterSummary semesterSummary = null;
            if (offering.getSemester() != null) {
                semesterSummary = CourseRegistrationResponse.SemesterSummary.builder()
                        .id(offering.getSemester().getId())
                        .name(offering.getSemester().getName())
                        .build();
            }

            offeringSummary = CourseRegistrationResponse.CourseOfferingSummary.builder()
                    .id(offering.getId())
                    .isPublished(offering.getIsPublished())
                    .course(courseSummary)
                    .semester(semesterSummary)
                    .build();
        }

        CourseRegistrationResponse.SectionSummary sectionSummary = null;
        Section section = registration.getSection();
        if (section != null) {
            sectionSummary = CourseRegistrationResponse.SectionSummary.builder()
                    .id(section.getId())
                    .name(section.getName())
                    .capacity(section.getCapacity())
                    .currentEnrollment(section.getCurrentEnrollment())
                    .build();
        }

        Student student = registration.getStudent();
        String studentName = null;
        String rollNumber = null;
        Long studentId = null;
        if (student != null) {
            studentId = student.getId();
            rollNumber = student.getRollNumber();
            String first = student.getFirstName() != null ? student.getFirstName() : "";
            String last = student.getLastName() != null ? student.getLastName() : "";
            studentName = (first + " " + last).trim();
            if (studentName.isEmpty()) {
                studentName = null;
            }
        }

        return CourseRegistrationResponse.builder()
                .id(registration.getId())
                .studentId(studentId)
                .studentName(studentName)
                .studentRollNumber(rollNumber)
                .courseOfferingId(offering != null ? offering.getId() : null)
                .sectionId(section != null ? section.getId() : null)
                .status(registration.getStatus())
                .registeredAt(registration.getRegisteredAt())
                .droppedAt(registration.getDroppedAt())
                .courseOffering(offeringSummary)
                .section(sectionSummary)
                .build();
    }
}
