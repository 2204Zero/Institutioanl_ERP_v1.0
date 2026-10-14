package com.erp.academic.room.controller;

import com.erp.academic.room.dto.RoomCreateRequest;
import com.erp.academic.room.dto.RoomResponse;
import com.erp.academic.room.dto.RoomUpdateRequest;
import com.erp.academic.room.entity.Room;
import com.erp.academic.room.repository.RoomRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import com.erp.academic.timetable.repository.TimetableSlotRepository;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;
    private final TimetableSlotRepository timetableSlotRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<RoomResponse>> getAllRooms(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        List<Room> rooms = includeInactive ? roomRepository.findAll() : roomRepository.findByIsActiveTrue();
        List<RoomResponse> response = rooms.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return ResponseEntity.ok(toResponse(room));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomCreateRequest request) {
        String trimmedName = request.getName().trim();
        if (roomRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new BusinessException("Room with name '" + trimmedName + "' already exists");
        }
        Room room = Room.builder()
                .name(trimmedName)
                .capacity(request.getCapacity())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        Room saved = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomUpdateRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        String trimmedName = request.getName().trim();
        roomRepository.findByNameIgnoreCase(trimmedName).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BusinessException("Another room with name '" + trimmedName + "' already exists");
            }
        });

        room.setName(trimmedName);
        room.setCapacity(request.getCapacity());
        if (request.getIsActive() != null) {
            room.setIsActive(request.getIsActive());
        }

        Room updated = roomRepository.save(room);
        return ResponseEntity.ok(toResponse(updated));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<RoomResponse> deactivateRoom(@PathVariable Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        room.setIsActive(false);
        return ResponseEntity.ok(toResponse(roomRepository.save(room)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<RoomResponse> activateRoom(@PathVariable Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        room.setIsActive(true);
        return ResponseEntity.ok(toResponse(roomRepository.save(room)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        long count = timetableSlotRepository != null ? timetableSlotRepository.countByRoomId(id) : 0L;
        if (count > 0) {
            throw new BusinessException("Cannot delete room '" + room.getName() + "' because it is referenced by " + count + " timetable slots. Please deactivate the room instead.");
        }
        roomRepository.delete(room);
        return ResponseEntity.noContent().build();
    }

    private RoomResponse toResponse(Room room) {
        long count = timetableSlotRepository != null ? timetableSlotRepository.countByRoomId(room.getId()) : 0L;
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .capacity(room.getCapacity())
                .isActive(room.getIsActive())
                .timetableSlotCount(count)
                .build();
    }
}
