package com.erp.academic.section.service;

import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.section.dto.*;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.entity.SectionFaculty;
import com.erp.academic.section.entity.SectionStudent;
import com.erp.academic.section.exception.SectionNotFoundException;
import com.erp.academic.section.mapper.SectionMapper;
import com.erp.academic.section.repository.SectionFacultyRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.academic.subject.entity.Subject;
import com.erp.academic.subject.repository.SubjectRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.exception.ValidationException;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository repository;
    private final SectionStudentRepository sectionStudentRepository;
    private final SectionFacultyRepository sectionFacultyRepository;
    private final BatchRepository batchRepository;
    private final SemesterRepository semesterRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final SectionMapper mapper;

    @Transactional
    public SectionResponse create(SectionCreateRequest request) {
        if (!batchRepository.existsById(request.getBatchId())) {
            throw new ResourceNotFoundException("Batch not found with id: " + request.getBatchId());
        }

        if (!semesterRepository.existsById(request.getSemesterId())) {
            throw new ResourceNotFoundException("Semester not found with id: " + request.getSemesterId());
        }

        if (request.getCapacity() <= 0) {
            throw new ValidationException("Section capacity must be greater than 0");
        }

        Section entity = mapper.toEntity(request);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }

        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> getAll(String search, Long batchId, Long semesterId, Boolean isActive) {
        return repository.searchAndFilter(search, batchId, semesterId, isActive).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SectionResponse getById(Long id) {
        Section entity = repository.findById(id).orElseThrow(() -> new SectionNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public SectionResponse update(Long id, SectionUpdateRequest request) {
        Section entity = repository.findById(id).orElseThrow(() -> new SectionNotFoundException(id));

        if (request.getBatchId() != null && !batchRepository.existsById(request.getBatchId())) {
            throw new ResourceNotFoundException("Batch not found with id: " + request.getBatchId());
        }

        if (request.getSemesterId() != null && !semesterRepository.existsById(request.getSemesterId())) {
            throw new ResourceNotFoundException("Semester not found with id: " + request.getSemesterId());
        }

        if (request.getCapacity() != null) {
            int currentEnrolled = sectionStudentRepository.countBySectionIdAndIsActiveTrue(id);
            if (request.getCapacity() < currentEnrolled) {
                throw new ValidationException("New capacity cannot be less than current active enrollment (" + currentEnrolled + ")");
            }
        }

        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public SectionResponse deactivate(Long id) {
        Section entity = repository.findById(id).orElseThrow(() -> new SectionNotFoundException(id));
        entity.setIsActive(false);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public SectionResponse activate(Long id) {
        Section entity = repository.findById(id).orElseThrow(() -> new SectionNotFoundException(id));
        entity.setIsActive(true);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new SectionNotFoundException(id);
        }
        sectionStudentRepository.deleteBySectionId(id);
        sectionFacultyRepository.deleteBySectionId(id);
        repository.deleteById(id);
    }

    // ==================== Student Assignment ====================

    @Transactional
    public List<SectionStudentResponse> assignStudents(Long sectionId, SectionStudentAssignRequest request) {
        Section section = repository.findById(sectionId).orElseThrow(() -> new SectionNotFoundException(sectionId));

        if (Boolean.FALSE.equals(section.getIsActive())) {
            throw new BusinessException("Cannot assign students to an inactive section");
        }

        int currentCount = sectionStudentRepository.countBySectionIdAndIsActiveTrue(sectionId);
        int availableCapacity = section.getCapacity() - currentCount;

        if (request.getStudentIds().size() > availableCapacity) {
            throw new BusinessException("Section capacity exceeded! Capacity: " + section.getCapacity() +
                    ", current enrollment: " + currentCount + ", available slots: " + availableCapacity);
        }

        List<SectionStudentResponse> responses = new ArrayList<>();

        for (Long studentId : request.getStudentIds()) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

            if (sectionStudentRepository.existsBySectionIdAndStudentIdAndIsActiveTrue(sectionId, studentId)) {
                throw new BusinessException("Student " + student.getRollNumber() + " is already assigned to this section");
            }

            Optional<SectionStudent> existingRecord = sectionStudentRepository.findBySectionIdAndStudentId(sectionId, studentId);
            SectionStudent record;
            if (existingRecord.isPresent()) {
                record = existingRecord.get();
                record.setIsActive(true);
            } else {
                record = SectionStudent.builder()
                        .sectionId(sectionId)
                        .studentId(studentId)
                        .isActive(true)
                        .build();
            }

            SectionStudent saved = sectionStudentRepository.save(record);

            responses.add(SectionStudentResponse.builder()
                    .id(saved.getId())
                    .sectionId(sectionId)
                    .studentId(studentId)
                    .rollNumber(student.getRollNumber())
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .assignedAt(saved.getAssignedAt())
                    .isActive(saved.getIsActive())
                    .build());
        }

        // Update enrollment count
        int updatedCount = sectionStudentRepository.countBySectionIdAndIsActiveTrue(sectionId);
        section.setCurrentEnrollment(updatedCount);
        repository.save(section);

        return responses;
    }

    @Transactional(readOnly = true)
    public List<SectionStudentResponse> getStudents(Long sectionId) {
        if (!repository.existsById(sectionId)) {
            throw new SectionNotFoundException(sectionId);
        }

        return sectionStudentRepository.findBySectionIdAndIsActiveTrue(sectionId).stream()
                .map(ss -> {
                    Optional<Student> studentOpt = studentRepository.findById(ss.getStudentId());
                    String roll = studentOpt.map(Student::getRollNumber).orElse("UNKNOWN");
                    String name = studentOpt.map(s -> s.getFirstName() + " " + s.getLastName()).orElse("UNKNOWN");

                    return SectionStudentResponse.builder()
                            .id(ss.getId())
                            .sectionId(ss.getSectionId())
                            .studentId(ss.getStudentId())
                            .rollNumber(roll)
                            .studentName(name)
                            .assignedAt(ss.getAssignedAt())
                            .isActive(ss.getIsActive())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeStudent(Long sectionId, Long studentId) {
        Section section = repository.findById(sectionId).orElseThrow(() -> new SectionNotFoundException(sectionId));

        SectionStudent assignment = sectionStudentRepository.findBySectionIdAndStudentId(sectionId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student " + studentId + " is not assigned to section " + sectionId));

        sectionStudentRepository.delete(assignment);

        int updatedCount = sectionStudentRepository.countBySectionIdAndIsActiveTrue(sectionId);
        section.setCurrentEnrollment(updatedCount);
        repository.save(section);
    }

    // ==================== Faculty / Class Association ====================

    @Transactional
    public SectionFacultyResponse assignFaculty(Long sectionId, SectionFacultyAssignRequest request) {
        if (!repository.existsById(sectionId)) {
            throw new SectionNotFoundException(sectionId);
        }

        String subjectName = null;
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));
            subjectName = subject.getName();
        }

        if (sectionFacultyRepository.existsBySectionIdAndFacultyIdAndSubjectId(sectionId, request.getFacultyId(), request.getSubjectId())) {
            throw new BusinessException("Faculty is already assigned to this section for this subject");
        }

        SectionFaculty assignment = SectionFaculty.builder()
                .sectionId(sectionId)
                .facultyId(request.getFacultyId())
                .subjectId(request.getSubjectId())
                .role(request.getRole().trim().toUpperCase())
                .build();

        SectionFaculty saved = sectionFacultyRepository.save(assignment);

        return SectionFacultyResponse.builder()
                .id(saved.getId())
                .sectionId(sectionId)
                .facultyId(saved.getFacultyId())
                .subjectId(saved.getSubjectId())
                .subjectName(subjectName)
                .role(saved.getRole())
                .assignedAt(saved.getAssignedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SectionFacultyResponse> getFaculty(Long sectionId) {
        if (!repository.existsById(sectionId)) {
            throw new SectionNotFoundException(sectionId);
        }

        return sectionFacultyRepository.findBySectionId(sectionId).stream()
                .map(sf -> {
                    String subName = null;
                    if (sf.getSubjectId() != null) {
                        subName = subjectRepository.findById(sf.getSubjectId())
                                .map(Subject::getName)
                                .orElse(null);
                    }

                    return SectionFacultyResponse.builder()
                            .id(sf.getId())
                            .sectionId(sf.getSectionId())
                            .facultyId(sf.getFacultyId())
                            .subjectId(sf.getSubjectId())
                            .subjectName(subName)
                            .role(sf.getRole())
                            .assignedAt(sf.getAssignedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeFaculty(Long sectionId, Long assignmentId) {
        if (!repository.existsById(sectionId)) {
            throw new SectionNotFoundException(sectionId);
        }

        SectionFaculty assignment = sectionFacultyRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty assignment not found with id: " + assignmentId));

        if (!assignment.getSectionId().equals(sectionId)) {
            throw new ValidationException("Faculty assignment does not belong to section " + sectionId);
        }

        sectionFacultyRepository.delete(assignment);
    }
}
