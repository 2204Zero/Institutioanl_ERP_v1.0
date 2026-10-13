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

    public synchronized NotificationRecord createNotification(Long userId, String title, String message, String type) {
        NotificationRecord record = NotificationRecord.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type != null ? type.toUpperCase() : "INFO")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationStore.save(record);
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
