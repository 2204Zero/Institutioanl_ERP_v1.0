package com.example.demo.session.controller;

import com.example.demo.session.dto.SessionResponse;
import com.example.demo.session.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('SESSION_READ')")
    public ResponseEntity<List<SessionResponse>> getUserSessions(@PathVariable Long userId) {
        return ResponseEntity.ok(sessionService.getUserActiveSessions(userId));
    }

    @DeleteMapping("/{token}")
    @PreAuthorize("hasAuthority('SESSION_DELETE')")
    public ResponseEntity<Void> invalidateSession(@PathVariable String token) {
        sessionService.invalidateSession(token);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('SESSION_DELETE')")
    public ResponseEntity<Void> invalidateAllUserSessions(@PathVariable Long userId) {
        sessionService.invalidateAllUserSessions(userId);
        return ResponseEntity.noContent().build();
    }
}
