package com.erp.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);

    // Map storing revoked Token IDs (JTI) and their expiry time
    private final Map<String, Date> revokedTokens = new ConcurrentHashMap<>();

    // Map storing active user sessions
    private final Map<String, UserSessionInfo> activeSessions = new ConcurrentHashMap<>();

    public record UserSessionInfo(
            String username,
            String role,
            String tokenId,
            String clientIp,
            Instant createdAt,
            Instant lastAccessedAt
    ) {
        public UserSessionInfo withLastAccessedAt(Instant now) {
            return new UserSessionInfo(username, role, tokenId, clientIp, createdAt, now);
        }
    }

    public void registerSession(String username, String role, String tokenId, String clientIp) {
        Instant now = Instant.now();
        activeSessions.put(username.toLowerCase(), new UserSessionInfo(username, role, tokenId, clientIp, now, now));
        log.info("Session created for user={}, tokenId={}", username, tokenId);
    }

    public void updateSessionAccess(String username) {
        if (username != null) {
            activeSessions.computeIfPresent(username.toLowerCase(), (k, session) -> session.withLastAccessedAt(Instant.now()));
        }
    }

    public void revokeToken(String tokenId, Date expiry) {
        if (tokenId != null) {
            revokedTokens.put(tokenId, expiry != null ? expiry : new Date(System.currentTimeMillis() + 86400000L));
            log.info("Token revoked: tokenId={}", tokenId);
        }
    }

    public boolean isTokenRevoked(String tokenId) {
        if (tokenId == null) {
            return false;
        }
        Date expiry = revokedTokens.get(tokenId);
        if (expiry == null) {
            return false;
        }
        if (expiry.before(new Date())) {
            // Already expired naturally, remove from blacklist
            revokedTokens.remove(tokenId);
            return false;
        }
        return true;
    }

    public void invalidateSession(String username) {
        if (username != null) {
            UserSessionInfo session = activeSessions.remove(username.toLowerCase());
            if (session != null && session.tokenId() != null) {
                revokeToken(session.tokenId(), new Date(System.currentTimeMillis() + 86400000L));
            }
            log.info("Session invalidated for user={}", username);
        }
    }

    public boolean isSessionValid(String username) {
        return username != null && activeSessions.containsKey(username.toLowerCase());
    }

    public UserSessionInfo getSession(String username) {
        if (username == null) {
            return null;
        }
        return activeSessions.get(username.toLowerCase());
    }

    // Periodic cleanup of expired tokens from blacklist to avoid memory leak
    public void cleanupExpiredTokens() {
        Date now = new Date();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}

