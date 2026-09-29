package com.example.demo.session.service;

import com.example.demo.session.dto.SessionResponse;
import java.util.List;

public interface SessionService {
    SessionResponse createSession(Long userId, String token, long durationMillis);
    boolean validateSession(String token);
    void invalidateSession(String token);
    void invalidateAllUserSessions(Long userId);
    List<SessionResponse> getUserActiveSessions(Long userId);
    void cleanUpExpiredSessions();
}
