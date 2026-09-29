package com.example.demo.session.repository;

import com.example.demo.session.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findBySessionToken(String sessionToken);
    List<Session> findByUserIdAndStatus(Long userId, String status);
    List<Session> findByExpiresAtBeforeAndStatus(LocalDateTime time, String status);
}
