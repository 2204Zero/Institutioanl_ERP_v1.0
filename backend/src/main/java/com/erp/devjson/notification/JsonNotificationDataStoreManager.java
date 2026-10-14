package com.erp.devjson.notification;

import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.NotificationJsonModels.NotificationRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Profile("dev-json")
public class JsonNotificationDataStoreManager {

    private final JsonEntityStore<NotificationRecord> notificationStore;

    @Autowired
    public JsonNotificationDataStoreManager(DevJsonProperties properties) {
        this(properties.getStoragePath());
    }

    public JsonNotificationDataStoreManager(Path baseDirectory) {
        JsonFileStorageEngine engine = new JsonFileStorageEngine();
        this.notificationStore = new JsonEntityStore<>(
                baseDirectory.resolve("notifications.json"),
                NotificationRecord.class, engine,
                NotificationRecord::getId, NotificationRecord::setId);
    }

    public synchronized NotificationRecord createNotification(Long userId, String title, String message, String type, String link) {
        // Prevent duplicate notifications within 5 minutes for same user, title and message
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        Optional<NotificationRecord> duplicate = notificationStore.findAll().stream()
                .filter(n -> userId.equals(n.getUserId()))
                .filter(n -> title != null && title.equalsIgnoreCase(n.getTitle()))
                .filter(n -> message != null && message.equalsIgnoreCase(n.getMessage()))
                .filter(n -> n.getCreatedAt() != null && n.getCreatedAt().isAfter(cutoff))
                .findFirst();
        if (duplicate.isPresent()) {
            return duplicate.get();
        }

        NotificationRecord record = NotificationRecord.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type != null ? type.toUpperCase() : "INFO")
                .link(link)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationStore.save(record);
    }

    public synchronized NotificationRecord createNotification(Long userId, String title, String message, String type) {
        return createNotification(userId, title, message, type, null);
    }

    public List<NotificationRecord> getNotificationsByUserId(Long userId) {
        if (userId == null) return List.of();
        return notificationStore.findAll().stream()
                .filter(n -> userId.equals(n.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public synchronized NotificationRecord markAsRead(Long id) {
        NotificationRecord n = notificationStore.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        n.setRead(true);
        return notificationStore.save(n);
    }

    public synchronized int markAllAsRead(Long userId) {
        if (userId == null) return 0;
        List<NotificationRecord> unread = notificationStore.findAll().stream()
                .filter(n -> userId.equals(n.getUserId()))
                .filter(n -> Boolean.FALSE.equals(n.getRead()))
                .collect(Collectors.toList());
        for (NotificationRecord n : unread) {
            n.setRead(true);
            notificationStore.save(n);
        }
        return unread.size();
    }

    public long getUnreadCount(Long userId) {
        if (userId == null) return 0;
        return notificationStore.findAll().stream()
                .filter(n -> userId.equals(n.getUserId()))
                .filter(n -> Boolean.FALSE.equals(n.getRead()))
                .count();
    }

    public long count() {
        return notificationStore.count();
    }

    public JsonEntityStore<NotificationRecord> getStore() {
        return notificationStore;
    }
}
