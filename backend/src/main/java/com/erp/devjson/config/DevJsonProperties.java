package com.erp.devjson.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.nio.file.Path;
import java.nio.file.Paths;

@Data
@Configuration
@Profile("dev-json")
@ConfigurationProperties(prefix = "erp.devjson")
public class DevJsonProperties {

    /**
     * Root directory for dev-json file storage.
     */
    private String storageDir = "data/dev-json";

    public Path getStoragePath() {
        return Paths.get(storageDir).toAbsolutePath().normalize();
    }
}
