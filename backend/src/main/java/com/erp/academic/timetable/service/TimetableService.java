package com.erp.academic.timetable.service;

import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableService {
    
    private final TimetableSlotRepository repository;

    @Transactional
    public TimetableSlot allocateSlot(TimetableSlot slot) {
        // Module 37: Schedule Conflict Detection
        long conflicts = repository.countConflicts(
                slot.getDayOfWeek(), slot.getStartTime(), slot.getEndTime(),
                slot.getFacultyId(), slot.getRoomId(), slot.getSectionId()
        );
        
        if (conflicts > 0) {
            throw new RuntimeException("Schedule Conflict Detected: Faculty, Room, or Section is already booked at this time.");
        }
        
        return repository.save(slot);
    }

    public List<TimetableSlot> getSectionTimetable(Long sectionId) {
        return repository.findBySectionIdAndIsActiveTrue(sectionId);
    }
}
