package com.example.demo.session.service.impl;

import com.example.demo.common.exception.ResourceNotFoundException;
import com.example.demo.session.dto.SessionResponse;
import com.example.demo.session.entity.Session;
import com.example.demo.session.repository.SessionRepository;
import com.example.demo.session.service.SessionService;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SessionServiceImpl implements SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionServiceImpl.class);
    
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionServiceImpl(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public SessionResponse createSession(Long userId, String token, long durationMillis) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Session session = new Session();
        session.setUser(user);
        session.setSessionToken(token);
        session.setExpiresAt(LocalDateTime.now().plusNanos(durationMillis * 1_000_000));
        session.setStatus("ACTIVE");

        Session saved = sessionRepository.save(session);
        log.info("Created active session for user {}", userId);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public boolean validateSession(String token) {
        Optional<Session> sessionOpt = sessionRepository.findBySessionToken(token);
        if (sessionOpt.isEmpty()) {
            return false;
        }
        
        Session session = sessionOpt.get();
        if (!"ACTIVE".equals(session.getStatus())) {
            return false;
        }
        
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setStatus("EXPIRED");
            sessionRepository.save(session);
            return false;
        }
        
        return true;
    }

    @Override
    @Transactional
    public void invalidateSession(String token) {
        sessionRepository.findBySessionToken(token).ifPresent(session -> {
            session.setStatus("REVOKED");
            sessionRepository.save(session);
            log.info("Session revoked.");
        });
    }

    @Override
    @Transactional
    public void invalidateAllUserSessions(Long userId) {
        List<Session> sessions = sessionRepository.findByUserIdAndStatus(userId, "ACTIVE");
        sessions.forEach(session -> session.setStatus("REVOKED"));
        sessionRepository.saveAll(sessions);
        log.info("All sessions revoked for user {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getUserActiveSessions(Long userId) {
        return sessionRepository.findByUserIdAndStatus(userId, "ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanUpExpiredSessions() {
        List<Session> expired = sessionRepository.findByExpiresAtBeforeAndStatus(LocalDateTime.now(), "ACTIVE");
        expired.forEach(session -> session.setStatus("EXPIRED"));
        sessionRepository.saveAll(expired);
        log.info("Cleaned up {} expired sessions", expired.size());
    }

    private SessionResponse mapToResponse(Session session) {
        return new SessionResponse(
                session.getId(),
                session.getSessionToken(),
                session.getExpiresAt(),
                session.getStatus()
        );
    }
}
