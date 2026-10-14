package com.erp.notification.controller;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.UserPrincipal;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.model.NotificationJsonModels.NotificationRecord;
import com.erp.devjson.notification.JsonNotificationDataStoreManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final UserRepository userRepository;
    private final JsonNotificationDataStoreManager notificationManager;

    @Autowired
    public NotificationController(UserRepository userRepository,
                                  @Autowired(required = false) JsonNotificationDataStoreManager notificationManager) {
        this.userRepository = userRepository;
        this.notificationManager = notificationManager;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        if (auth.getPrincipal() instanceof UserPrincipal up && up.getId() != null) {
            return up.getId();
        }
        return userRepository.findByUsernameIgnoreCase(auth.getName())
                .map(AppUser::getId)
                .orElse(null);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationRecord>> getMyNotifications(Authentication auth) {
        if (notificationManager == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        Long userId = getCurrentUserId(auth);
        if (userId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(notificationManager.getNotificationsByUserId(userId));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        if (notificationManager == null) {
            return ResponseEntity.ok(Map.of("unreadCount", 0L, "count", 0L));
        }
        Long userId = getCurrentUserId(auth);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("unreadCount", 0L, "count", 0L));
        }
        long count = notificationManager.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count, "count", count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationRecord> markAsRead(@PathVariable Long id, Authentication auth) {
        if (notificationManager == null) {
            throw new ResourceNotFoundException("Notification service not active");
        }
        NotificationRecord record = notificationManager.getStore().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        Long currentUserId = getCurrentUserId(auth);
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!isAdmin && (currentUserId == null || !currentUserId.equals(record.getUserId()))) {
            throw new AccessDeniedException("You do not own this notification");
        }

        NotificationRecord updated = notificationManager.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication auth) {
        if (notificationManager == null) {
            return ResponseEntity.ok(Map.of("marked", 0));
        }
        Long userId = getCurrentUserId(auth);
        if (userId == null) {
            return ResponseEntity.ok(Map.of("marked", 0));
        }
        int count = notificationManager.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("marked", count));
    }

    public record CreateNotificationRequest(Long userId, String title, String message, String type) {}

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NotificationRecord> createNotification(@RequestBody CreateNotificationRequest request) {
        if (notificationManager == null) {
            throw new ResourceNotFoundException("Notification service not active");
        }
        NotificationRecord record = notificationManager.createNotification(
                request.userId(),
                request.title(),
                request.message(),
                request.type()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }
}
