package com.erp.academic.timetable.entity;

import com.erp.academic.room.entity.Room;
import com.erp.academic.section.entity.Section;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "class_schedule", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"room_id", "time_slot_id"}),
    @UniqueConstraint(columnNames = {"faculty_id", "time_slot_id"}),
    @UniqueConstraint(columnNames = {"section_id", "time_slot_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "faculty_id", nullable = false)
    private Long facultyId;
}
