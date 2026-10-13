package com.erp.academic.room.repository;

import com.erp.academic.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByNameIgnoreCase(String name);
    java.util.Optional<Room> findByNameIgnoreCase(String name);
    java.util.List<Room> findByIsActiveTrue();
}
