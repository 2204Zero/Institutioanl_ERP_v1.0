package com.erp.it.postgres;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Fail-fast security and safety guard for database integration tests.
 * Prevents any accidental test execution or destructive DDL/DML against
 * shared or production databases ('edupulse_erp', 'one', etc.).
 */
public final class PostgresSafetyGuard {

    private static final Pattern JDBC_POSTGRES_PATTERN =
            Pattern.compile("^jdbc:postgresql://([^:/]+)(?::(\\d+))?/([^?]+)(?:\\?.*)?$");

    private static final String ALLOWED_TEST_DB_NAME = "edupulse_test";

    private PostgresSafetyGuard() {}

    /**
     * Validates that the provided JDBC URL targets an authorized, isolated test database.
     * Rejects any connection targeting protected databases ('edupulse_erp', 'one')
     * or any database that is not strictly the designated test database ('edupulse_test').
     *
     * @param jdbcUrl The JDBC URL to validate.
     * @throws SecurityException if the URL targets a protected or unapproved database.
     * @throws IllegalArgumentException if the URL is null, blank, or not a recognized PostgreSQL JDBC URL.
     */
    public static void validateTestDatabaseUrl(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("SAFETY ABORT: JDBC URL cannot be null or blank");
        }

        String trimmed = jdbcUrl.trim();
        Matcher matcher = JDBC_POSTGRES_PATTERN.matcher(trimmed);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("SAFETY ABORT: Unrecognized or non-PostgreSQL JDBC URL format: " + trimmed);
        }

        String dbName = matcher.group(3).toLowerCase();

        // 1. Strict rejection of known protected databases
        if ("edupulse_erp".equals(dbName)) {
            throw new SecurityException("SAFETY VIOLATION: Execution against protected database 'edupulse_erp' is strictly forbidden.");
        }
        if ("one".equals(dbName)) {
            throw new SecurityException("SAFETY VIOLATION: Execution against protected database 'one' is strictly forbidden.");
        }

        // 2. Strict enforcement of approved test database name
        if (!ALLOWED_TEST_DB_NAME.equals(dbName)) {
            throw new SecurityException("SAFETY VIOLATION: Database target '" + dbName + "' is not the approved test database ('" + ALLOWED_TEST_DB_NAME + "').");
        }
    }
}
