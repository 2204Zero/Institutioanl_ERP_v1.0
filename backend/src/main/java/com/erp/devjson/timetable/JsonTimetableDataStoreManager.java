package com.erp.devjson.timetable;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.academic.JsonAcademicDataStoreManager;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.faculty.JsonFacultyDataStoreManager;
import com.erp.devjson.model.TimetableJsonModels.TimetableSlotRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Profile("dev-json")
public class JsonTimetableDataStoreManager {

    private final JsonEntityStore<TimetableSlotRecord> slotStore;
    private final JsonAcademicDataStoreManager academicManager;
    private final JsonFacultyDataStoreManager facultyManager;

    @Autowired
    public JsonTimetableDataStoreManager(
            DevJsonProperties properties,
            JsonAcademicDataStoreManager academicManager,
            JsonFacultyDataStoreManager facultyManager) {
        this(properties.getStoragePath(), academicManager, facultyManager);
    }

    public JsonTimetableDataStoreManager(
            Path baseDirectory,
            JsonAcademicDataStoreManager academicManager,
            JsonFacultyDataStoreManager facultyManager) {
        this.academicManager = academicManager;
        this.facultyManager = facultyManager;
        JsonFileStorageEngine engine = new JsonFileStorageEngine();
        this.slotStore = new JsonEntityStore<>(
                baseDirectory.resolve("timetable_slots.json"),
                TimetableSlotRecord.class, engine,
                TimetableSlotRecord::getId, TimetableSlotRecord::setId);
    }

    public synchronized TimetableSlotRecord createSlot(TimetableSlotRecord slot) {
        if (slot.getSectionId() == null) {
            throw new BusinessException("Section ID cannot be null");
        }
        if (slot.getDayOfWeek() == null || slot.getDayOfWeek() < 1 || slot.getDayOfWeek() > 7) {
            throw new BusinessException("Valid day of week (1-7) is required");
        }
        if (slot.getStartTime() == null || slot.getEndTime() == null) {
            throw new BusinessException("Start and end time are required");
        }
        if (!slot.getStartTime().isBefore(slot.getEndTime())) {
            throw new BusinessException("Start time must be before end time");
        }

        if (academicManager != null && academicManager.getSectionById(slot.getSectionId()).isEmpty()) {
            throw new ResourceNotFoundException("Section not found with id: " + slot.getSectionId());
        }

        if (slot.getFacultyId() != null && facultyManager != null) {
            if (facultyManager.getFacultyById(slot.getFacultyId()).isEmpty()) {
                throw new ResourceNotFoundException("Faculty not found with id: " + slot.getFacultyId());
            }
        }

        // Conflict check: Overlapping slot for the same section
        boolean sectionConflict = slotStore.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .filter(s -> s.getSectionId().equals(slot.getSectionId()))
                .filter(s -> s.getDayOfWeek().equals(slot.getDayOfWeek()))
                .anyMatch(s -> s.getStartTime().isBefore(slot.getEndTime()) && s.getEndTime().isAfter(slot.getStartTime()));
        if (sectionConflict) {
            throw new BusinessException("Schedule conflict: Section already has a class scheduled in this time slot");
        }

        // Conflict check: Overlapping slot for the same faculty
        if (slot.getFacultyId() != null) {
            boolean facultyConflict = slotStore.findAll().stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                    .filter(s -> slot.getFacultyId().equals(s.getFacultyId()))
                    .filter(s -> s.getDayOfWeek().equals(slot.getDayOfWeek()))
                    .anyMatch(s -> s.getStartTime().isBefore(slot.getEndTime()) && s.getEndTime().isAfter(slot.getStartTime()));
            if (facultyConflict) {
                throw new BusinessException("Schedule conflict: Faculty is already assigned to another section in this time slot");
            }
        }

        if (slot.getIsActive() == null) {
            slot.setIsActive(true);
        }
        return slotStore.save(slot);
    }

    public Optional<TimetableSlotRecord> getSlotById(Long id) {
        return slotStore.findById(id);
    }

    public List<TimetableSlotRecord> getSlotsBySectionId(Long sectionId) {
        if (sectionId == null) return List.of();
        return slotStore.findAll().stream()
                .filter(s -> sectionId.equals(s.getSectionId()))
                .collect(Collectors.toList());
    }

    public List<TimetableSlotRecord> getSlotsByFacultyId(Long facultyId) {
        if (facultyId == null) return List.of();
        return slotStore.findAll().stream()
                .filter(s -> facultyId.equals(s.getFacultyId()))
                .collect(Collectors.toList());
    }

    public List<TimetableSlotRecord> getAllSlots() {
        return slotStore.findAll();
    }

    public long count() {
        return slotStore.count();
    }

    public JsonEntityStore<TimetableSlotRecord> getStore() {
        return slotStore;
    }
}
