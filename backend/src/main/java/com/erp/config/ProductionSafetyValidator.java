package com.erp.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

import java.util.List;

/**
 * Production environment safety validator.
 * Enforces strict production invariants:
 * 1. Prohibits co-activation of development/mock profiles (dev, dev-json) to prevent silent JSON fallback.
 * 2. Requires a valid hosted PostgreSQL JDBC URL (rejects localhost, 127.0.0.1, and in-memory H2).
 * 3. Enforces TLS/SSL encryption for cloud database connectivity.
 */
@Slf4j
@Configuration
@Profile("prod")
@RequiredArgsConstructor
public class ProductionSafetyValidator {

    private final Environment environment;

    private static final List<String> FORBIDDEN_DEV_PROFILES = List.of("dev-json", "dev");

    @PostConstruct
    public void validateProductionEnvironment() {
        // 1. Ensure dev or dev-json cannot be co-activated with prod
        for (String forbidden : FORBIDDEN_DEV_PROFILES) {
            if (environment.acceptsProfiles(Profiles.of(forbidden))) {
                throw new IllegalStateException(
                    "FATAL CONFIGURATION ERROR: Production profile ('prod') cannot be active concurrently with '"
                    + forbidden + "'. JSON fallback is strictly prohibited in production."
                );
            }
        }

        // 2. Ensure datasource URL is PostgreSQL and not localhost or H2
        String url = environment.getProperty("spring.datasource.url");
        if (url == null || url.isBlank()) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: 'spring.datasource.url' is mandatory in production profile. Missing database configuration."
            );
        }

        String username = environment.getProperty("spring.datasource.username");
        if (username == null || username.isBlank()) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: 'spring.datasource.username' is mandatory in production profile. Missing database credentials."
            );
        }

        String lowerUrl = url.trim().toLowerCase();
        if (lowerUrl.contains("localhost") || lowerUrl.contains("127.0.0.1")) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: Production database URL cannot point to localhost or 127.0.0.1. A dedicated, hosted PostgreSQL instance is required."
            );
        }

        if (lowerUrl.startsWith("jdbc:h2:")) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: Production database URL cannot use in-memory H2 storage. Persistent PostgreSQL is required."
            );
        }

        if (!lowerUrl.startsWith("jdbc:postgresql:")) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: Production database URL must use PostgreSQL JDBC ('jdbc:postgresql:...'). Found: " + lowerUrl
            );
        }

        // 3. Ensure TLS is required and cannot be disabled by conflicting parameters
        if (lowerUrl.contains("sslmode=disable") || lowerUrl.contains("ssl=false")) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: Disabling TLS (sslmode=disable / ssl=false) is strictly prohibited in production."
            );
        }

        String sslProperty = environment.getProperty("spring.datasource.hikari.data-source-properties.sslmode");
        if ("disable".equalsIgnoreCase(sslProperty)) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: Disabling TLS via datasource property (sslmode=disable) is strictly prohibited in production."
            );
        }

        boolean hasSslInUrl = lowerUrl.contains("sslmode=require")
                           || lowerUrl.contains("sslmode=verify-full")
                           || lowerUrl.contains("sslmode=verify-ca")
                           || lowerUrl.contains("ssl=true");
        boolean hasSslInProperties = "require".equalsIgnoreCase(sslProperty)
                                  || "verify-full".equalsIgnoreCase(sslProperty)
                                  || "verify-ca".equalsIgnoreCase(sslProperty);

        if (!hasSslInUrl && !hasSslInProperties) {
            throw new IllegalStateException(
                "FATAL CONFIGURATION ERROR: Hosted PostgreSQL connection in production must require TLS (sslmode=require)."
            );
        }

        log.info("Production environment verified: PostgreSQL configured, dev-json prohibited, TLS enforced.");
    }
}
