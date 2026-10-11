package com.erp.it.postgres;

import org.junit.jupiter.api.BeforeAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

/**
 * Base class for all PostgreSQL integration tests.
 * Enforces profile "pgtest" and validates that the configured datasource
 * targets strictly the designated isolated test database ('edupulse_test')
 * before any database connection, Spring-triggered database access, or Flyway execution.
 */
@SpringBootTest
@ActiveProfiles("pgtest")
@ContextConfiguration(initializers = PostgresSafetyGuardInitializer.class)
public abstract class AbstractPostgresIT {

    @BeforeAll
    static void assertDatabaseSafety(@Autowired Environment environment) {
        String url = environment.getProperty("spring.datasource.url");
        PostgresSafetyGuard.validateTestDatabaseUrl(url);
    }
}
