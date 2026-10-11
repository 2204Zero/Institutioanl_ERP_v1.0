package com.erp.it.postgres;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * ApplicationContextInitializer that executes before any bean creation,
 * HikariCP connection initialization, or Flyway database access.
 *
 * Enforces that any test context configured for PostgreSQL strictly targets
 * the isolated test database ('edupulse_test') and rejects 'edupulse_erp', 'one',
 * or any unauthorized database.
 */
public class PostgresSafetyGuardInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        String url = applicationContext.getEnvironment().getProperty("spring.datasource.url");
        PostgresSafetyGuard.validateTestDatabaseUrl(url);
    }
}
