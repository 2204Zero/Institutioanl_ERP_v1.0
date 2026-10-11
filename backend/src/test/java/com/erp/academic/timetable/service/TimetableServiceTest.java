package com.erp.academic.timetable.service;

import com.erp.academic.room.repository.RoomRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TimetableServiceTest {

    @Mock
    private TimetableSlotRepository repository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @InjectMocks
    private TimetableService timetableService;

    private TimetableSlot slot;

    @BeforeEach
    public void setup() {
        slot = new TimetableSlot();
        slot.setRoomId(1L);
        slot.setSectionId(1L);
        slot.setFacultyId(1L);
        slot.setDayOfWeek(DayOfWeek.MONDAY);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
    }

    @Test
    public void testAllocateSlot_Success() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(sectionRepository.existsById(1L)).thenReturn(true);
        when(facultyRepository.existsById(1L)).thenReturn(true);
        when(repository.countConflicts(any(), any(), any(), any(), any(), any())).thenReturn(0L);
        when(repository.save(any(TimetableSlot.class))).thenReturn(slot);

        TimetableSlot saved = timetableService.allocateSlot(slot);
        assertNotNull(saved);
        verify(repository, times(1)).save(slot);
    }

    @Test
    public void testAllocateSlot_RoomNotFound() {
        when(roomRepository.existsById(1L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> timetableService.allocateSlot(slot));
        assertEquals("Room not found", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    public void testAllocateSlot_SectionNotFound() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(sectionRepository.existsById(1L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> timetableService.allocateSlot(slot));
        assertEquals("Section not found", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    public void testAllocateSlot_FacultyNotFound() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(sectionRepository.existsById(1L)).thenReturn(true);
        when(facultyRepository.existsById(1L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> timetableService.allocateSlot(slot));
        assertEquals("Faculty not found", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    public void testAllocateSlot_InvalidTimeRange() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(sectionRepository.existsById(1L)).thenReturn(true);
        when(facultyRepository.existsById(1L)).thenReturn(true);
        slot.setStartTime(LocalTime.of(10, 0));
        slot.setEndTime(LocalTime.of(9, 0));

        BusinessException ex = assertThrows(BusinessException.class, () -> timetableService.allocateSlot(slot));
        assertEquals("End time must be after start time", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    public void testAllocateSlot_ScheduleConflict() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(sectionRepository.existsById(1L)).thenReturn(true);
        when(facultyRepository.existsById(1L)).thenReturn(true);
        when(repository.countConflicts(any(), any(), any(), any(), any(), any())).thenReturn(1L);

        BusinessException ex = assertThrows(BusinessException.class, () -> timetableService.allocateSlot(slot));
        assertEquals("Schedule Conflict Detected: Faculty, Room, or Section is already booked at this time.", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    public void testAllocateSlot_ValidatesFacultyRepositoryWhenUserIdDiffers() {
        // Faculty ID is 9999L (domain ID) while user account id might be different
        slot.setFacultyId(9999L);
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(sectionRepository.existsById(1L)).thenReturn(true);
        when(facultyRepository.existsById(9999L)).thenReturn(true);
        when(repository.countConflicts(any(), any(), any(), any(), any(), any())).thenReturn(0L);
        when(repository.save(any(TimetableSlot.class))).thenReturn(slot);

        TimetableSlot saved = timetableService.allocateSlot(slot);
        assertNotNull(saved);
        verify(facultyRepository, times(1)).existsById(9999L);
    }
}
