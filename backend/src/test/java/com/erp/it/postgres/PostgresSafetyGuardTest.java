package com.erp.it.postgres;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class PostgresSafetyGuardTest {

    @Test
    @DisplayName("Should accept valid approved test database URL without query params")
    void shouldAcceptApprovedTestDatabase() {
        assertDoesNotThrow(() ->
                PostgresSafetyGuard.validateTestDatabaseUrl("jdbc:postgresql://localhost:5432/edupulse_test")
        );
    }

    @Test
    @DisplayName("Should accept valid approved test database URL with query parameters")
    void shouldAcceptApprovedTestDatabaseWithParams() {
        assertDoesNotThrow(() ->
                PostgresSafetyGuard.validateTestDatabaseUrl("jdbc:postgresql://postgres-host:5432/edupulse_test?sslmode=disable&currentSchema=public")
        );
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "jdbc:postgresql://localhost:5432/edupulse_erp",
            "jdbc:postgresql://localhost:5432/EDUPULSE_ERP",
            "jdbc:postgresql://localhost:5432/EduPulse_ERP?ssl=true",
            "jdbc:postgresql://db.prod.internal:5432/edupulse_erp",
            "jdbc:postgresql://localhost/edupulse_erp"
    })
    @DisplayName("Should strictly reject any connection to protected edupulse_erp database")
    void shouldRejectEdupulseErpDatabase(String url) {
        SecurityException ex = assertThrows(SecurityException.class, () ->
                PostgresSafetyGuard.validateTestDatabaseUrl(url)
        );
        assertTrue(ex.getMessage().contains("edupulse_erp"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "jdbc:postgresql://localhost:5432/one",
            "jdbc:postgresql://localhost:5432/ONE",
            "jdbc:postgresql://localhost:5432/One?currentSchema=public",
            "jdbc:postgresql://127.0.0.1:5432/one"
    })
    @DisplayName("Should strictly reject any connection to protected database 'one'")
    void shouldRejectDatabaseOne(String url) {
        SecurityException ex = assertThrows(SecurityException.class, () ->
                PostgresSafetyGuard.validateTestDatabaseUrl(url)
        );
        assertTrue(ex.getMessage().contains("one"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "jdbc:postgresql://localhost:5432/postgres",
            "jdbc:postgresql://localhost:5432/production_db",
            "jdbc:postgresql://localhost:5432/other_db"
    })
    @DisplayName("Should reject unapproved database targets")
    void shouldRejectUnapprovedDatabaseTargets(String url) {
        SecurityException ex = assertThrows(SecurityException.class, () ->
                PostgresSafetyGuard.validateTestDatabaseUrl(url)
        );
        assertTrue(ex.getMessage().contains("not the approved test database"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "",
            "   ",
            "jdbc:h2:mem:test_db",
            "jdbc:mysql://localhost:3306/edupulse_test",
            "invalid-url"
    })
    @DisplayName("Should throw IllegalArgumentException for blank or non-PostgreSQL URLs")
    void shouldRejectInvalidUrls(String url) {
        assertThrows(IllegalArgumentException.class, () ->
                PostgresSafetyGuard.validateTestDatabaseUrl(url)
        );
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for null URL")
    void shouldRejectNullUrl() {
        assertThrows(IllegalArgumentException.class, () ->
                PostgresSafetyGuard.validateTestDatabaseUrl(null)
        );
    }
}
