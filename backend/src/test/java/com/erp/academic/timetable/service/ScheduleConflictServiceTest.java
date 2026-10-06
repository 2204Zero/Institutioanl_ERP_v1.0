package com.erp.academic.timetable.service;

import com.erp.academic.room.entity.Room;
import com.erp.academic.room.repository.RoomRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.timetable.entity.ClassSchedule;
import com.erp.academic.timetable.entity.TimeSlot;
import com.erp.academic.timetable.repository.ClassScheduleRepository;
import com.erp.academic.timetable.repository.TimeSlotRepository;
import com.erp.common.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ScheduleConflictServiceTest {

    @Mock private ClassScheduleRepository classScheduleRepository;
    @Mock private SectionRepository sectionRepository;
    @Mock private RoomRepository roomRepository;
    @Mock private TimeSlotRepository timeSlotRepository;

    @InjectMocks
    private ScheduleConflictService scheduleConflictService;

    private Section section;
    private Room room;
    private TimeSlot timeSlot;

    @BeforeEach
    void setUp() {
        section = Section.builder().id(10L).name("CS101-A").build();
        room = Room.builder().id(20L).name("Room 1").build();
        timeSlot = TimeSlot.builder().id(30L).build();

        lenient().when(sectionRepository.findById(10L)).thenReturn(Optional.of(section));
        lenient().when(roomRepository.findById(20L)).thenReturn(Optional.of(room));
        lenient().when(timeSlotRepository.findById(30L)).thenReturn(Optional.of(timeSlot));
    }

    @Test
    void testRoomConflict() {
        when(classScheduleRepository.existsByRoomIdAndTimeSlotId(20L, 30L)).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> 
            scheduleConflictService.allocateSchedule(10L, 20L, 30L, 40L));

        assertTrue(exception.getMessage().contains("Room Room 1 is already booked"));
    }

    @Test
    void testFacultyConflict() {
        when(classScheduleRepository.existsByRoomIdAndTimeSlotId(20L, 30L)).thenReturn(false);
        when(classScheduleRepository.existsByFacultyIdAndTimeSlotId(40L, 30L)).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> 
            scheduleConflictService.allocateSchedule(10L, 20L, 30L, 40L));

        assertTrue(exception.getMessage().contains("Faculty member is already teaching"));
    }

    @Test
    void testSectionConflict() {
        when(classScheduleRepository.existsByRoomIdAndTimeSlotId(20L, 30L)).thenReturn(false);
        when(classScheduleRepository.existsByFacultyIdAndTimeSlotId(40L, 30L)).thenReturn(false);
        when(classScheduleRepository.existsBySectionIdAndTimeSlotId(10L, 30L)).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> 
            scheduleConflictService.allocateSchedule(10L, 20L, 30L, 40L));

        assertTrue(exception.getMessage().contains("The section CS101-A is already scheduled"));
    }

    @Test
    void testSuccessfulAllocation() {
        when(classScheduleRepository.existsByRoomIdAndTimeSlotId(anyLong(), anyLong())).thenReturn(false);
        when(classScheduleRepository.existsByFacultyIdAndTimeSlotId(anyLong(), anyLong())).thenReturn(false);
        when(classScheduleRepository.existsBySectionIdAndTimeSlotId(anyLong(), anyLong())).thenReturn(false);

        ClassSchedule mockSave = ClassSchedule.builder().id(99L).build();
        when(classScheduleRepository.save(any())).thenReturn(mockSave);

        ClassSchedule result = scheduleConflictService.allocateSchedule(10L, 20L, 30L, 40L);

        assertNotNull(result);
        assertEquals(99L, result.getId());
        verify(classScheduleRepository, times(1)).save(any(ClassSchedule.class));
    }
}
