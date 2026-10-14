package com.erp.common.controller;

import com.erp.devjson.config.DevJsonProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping
@Tag(name = "Health & Readiness", description = "Public health, readiness, and storage liveness checks for container orchestration")
public class HealthController {

    private final DevJsonProperties devJsonProperties;

    public HealthController(@Autowired(required = false) DevJsonProperties devJsonProperties) {
        this.devJsonProperties = devJsonProperties;
    }

    @GetMapping({"/api/health", "/api/v1/health", "/actuator/health"})
    @Operation(summary = "Application Health & Readiness", description = "Verifies application liveness and storage volume availability")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now().toString());

        if (devJsonProperties != null) {
            Path storagePath = devJsonProperties.getStoragePath();
            boolean exists = Files.exists(storagePath);
            boolean isDir = Files.isDirectory(storagePath);
            boolean isWritable = Files.isWritable(storagePath);

            Map<String, Object> storageDetails = new LinkedHashMap<>();
            storageDetails.put("mode", "dev-json");
            storageDetails.put("path", storagePath.toString());
            storageDetails.put("exists", exists);
            storageDetails.put("writable", isWritable);

            if (!exists || !isDir || !isWritable) {
                response.put("status", "DOWN");
                response.put("error", "Persistent JSON storage is unavailable or not writable");
                response.put("storage", storageDetails);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            response.put("storage", storageDetails);
        }

        return ResponseEntity.ok(response);
    }
}
