package com.erp.it.postgres;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PostgresSafetyGuardInitializerTest {

    private final PostgresSafetyGuardInitializer initializer = new PostgresSafetyGuardInitializer();

    @Test
    @DisplayName("Should successfully initialize context when target database is edupulse_test")
    void shouldAllowApprovedTestDatabase() {
        GenericApplicationContext context = new GenericApplicationContext();
        context.getEnvironment().getPropertySources().addFirst(
                new MapPropertySource("testProperties", Map.of(
                        "spring.datasource.url", "jdbc:postgresql://localhost:5432/edupulse_test"
                ))
        );

        assertDoesNotThrow(() -> initializer.initialize(context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "jdbc:postgresql://localhost:5432/edupulse_erp",
            "jdbc:postgresql://localhost:5432/EDUPULSE_ERP",
            "jdbc:postgresql://prod-db:5432/edupulse_erp?ssl=true"
    })
    @DisplayName("Should abort context initialization with SecurityException for edupulse_erp before any bean creation")
    void shouldRejectEdupulseErp(String url) {
        GenericApplicationContext context = new GenericApplicationContext();
        context.getEnvironment().getPropertySources().addFirst(
                new MapPropertySource("testProperties", Map.of(
                        "spring.datasource.url", url
                ))
        );

        SecurityException ex = assertThrows(SecurityException.class, () -> initializer.initialize(context));
        assertTrue(ex.getMessage().contains("edupulse_erp"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "jdbc:postgresql://localhost:5432/one",
            "jdbc:postgresql://localhost:5432/ONE",
            "jdbc:postgresql://10.0.0.1:5432/one"
    })
    @DisplayName("Should abort context initialization with SecurityException for 'one' before any bean creation")
    void shouldRejectDatabaseOne(String url) {
        GenericApplicationContext context = new GenericApplicationContext();
        context.getEnvironment().getPropertySources().addFirst(
                new MapPropertySource("testProperties", Map.of(
                        "spring.datasource.url", url
                ))
        );

        SecurityException ex = assertThrows(SecurityException.class, () -> initializer.initialize(context));
        assertTrue(ex.getMessage().contains("one"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "jdbc:postgresql://localhost:5432/postgres",
            "jdbc:postgresql://localhost:5432/some_other_db"
    })
    @DisplayName("Should abort context initialization for any unapproved database")
    void shouldRejectUnapprovedDatabases(String url) {
        GenericApplicationContext context = new GenericApplicationContext();
        context.getEnvironment().getPropertySources().addFirst(
                new MapPropertySource("testProperties", Map.of(
                        "spring.datasource.url", url
                ))
        );

        SecurityException ex = assertThrows(SecurityException.class, () -> initializer.initialize(context));
        assertTrue(ex.getMessage().contains("not the approved test database"));
    }

    @Test
    @DisplayName("Should abort context initialization if spring.datasource.url is missing")
    void shouldRejectMissingUrl() {
        GenericApplicationContext context = new GenericApplicationContext();

        assertThrows(IllegalArgumentException.class, () -> initializer.initialize(context));
    }
}
