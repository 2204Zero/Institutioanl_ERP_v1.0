package com.erp.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class ProductionProfileConfigurationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(ProductionSafetyValidator.class);

    @Test
    @DisplayName("1. Production profile accepts valid hosted PostgreSQL with TLS")
    void shouldAcceptValidPostgresNeonConfiguration() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:postgresql://ep-snowy-silence.c-3.ap-southeast-1.aws.neon.tech:5432/edupulse_prod?sslmode=require",
                        "spring.datasource.username=edupulse_prod_owner",
                        "spring.datasource.password=dummyPassword",
                        "spring.datasource.hikari.data-source-properties.sslmode=require",
                        "spring.jpa.hibernate.ddl-auto=validate",
                        "spring.flyway.enabled=true"
                )
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(ProductionSafetyValidator.class);
                    // Verify environment properties
                    assertThat(context.getEnvironment().getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
                    assertThat(context.getEnvironment().getProperty("spring.flyway.enabled")).isEqualTo("true");
                    // Verify that no dev-json beans exist
                    assertThat(context.containsBean("jsonStudentDataStoreManager")).isFalse();
                    assertThat(context.containsBean("devJsonSyncEngine")).isFalse();
                });
    }

    @Test
    @DisplayName("2. Production profile fails fast if dev-json is co-activated (prevents silent JSON fallback)")
    void shouldFailWhenDevJsonIsCoActivatedWithProd() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod,dev-json",
                        "spring.datasource.url=jdbc:postgresql://ep-test.neon.tech:5432/edupulse_prod?sslmode=require",
                        "spring.datasource.username=edupulse_prod_owner"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Production profile ('prod') cannot be active concurrently with 'dev-json'. JSON fallback is strictly prohibited in production.");
                });
    }

    @Test
    @DisplayName("3. Production profile fails fast if dev profile is co-activated")
    void shouldFailWhenDevIsCoActivatedWithProd() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod,dev",
                        "spring.datasource.url=jdbc:postgresql://ep-test.neon.tech:5432/edupulse_prod?sslmode=require",
                        "spring.datasource.username=edupulse_prod_owner"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Production profile ('prod') cannot be active concurrently with 'dev'. JSON fallback is strictly prohibited in production.");
                });
    }

    @Test
    @DisplayName("4. Production profile fails fast if datasource points to localhost")
    void shouldFailWhenDatasourcePointsToLocalhost() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:postgresql://localhost:5432/edupulse_erp?sslmode=require",
                        "spring.datasource.username=edupulse_prod_owner"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Production database URL cannot point to localhost or 127.0.0.1. A dedicated, hosted PostgreSQL instance is required.");
                });
    }

    @Test
    @DisplayName("5. Production profile fails fast if datasource points to 127.0.0.1")
    void shouldFailWhenDatasourcePointsTo127001() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/edupulse_erp?sslmode=require",
                        "spring.datasource.username=edupulse_prod_owner"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Production database URL cannot point to localhost or 127.0.0.1. A dedicated, hosted PostgreSQL instance is required.");
                });
    }

    @Test
    @DisplayName("6. Production profile fails fast if datasource uses in-memory H2")
    void shouldFailWhenDatasourceUsesH2() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:h2:mem:erp_db",
                        "spring.datasource.username=sa"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Production database URL cannot use in-memory H2 storage. Persistent PostgreSQL is required.");
                });
    }

    @Test
    @DisplayName("7. Production profile fails fast if TLS is not enforced")
    void shouldFailWhenTlsIsNotEnforced() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:postgresql://ep-test.aws.neon.tech:5432/edupulse_prod",
                        "spring.datasource.username=edupulse_prod_owner"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Hosted PostgreSQL connection in production must require TLS (sslmode=require).");
                });
    }

    @Test
    @DisplayName("8. Production profile fails fast if conflicting parameter attempts to disable TLS")
    void shouldFailWhenTlsIsExplicitlyDisabledInUrl() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:postgresql://ep-test.aws.neon.tech:5432/edupulse_prod?sslmode=disable",
                        "spring.datasource.username=edupulse_prod_owner",
                        "spring.datasource.hikari.data-source-properties.sslmode=require"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Disabling TLS (sslmode=disable / ssl=false) is strictly prohibited in production.");
                });
    }

    @Test
    @DisplayName("9. Production profile fails fast if datasource property attempts to disable TLS")
    void shouldFailWhenTlsIsExplicitlyDisabledInProperty() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:postgresql://ep-test.aws.neon.tech:5432/edupulse_prod?sslmode=require",
                        "spring.datasource.username=edupulse_prod_owner",
                        "spring.datasource.hikari.data-source-properties.sslmode=disable"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: Disabling TLS via datasource property (sslmode=disable) is strictly prohibited in production.");
                });
    }

    @Test
    @DisplayName("10. Production profile fails fast if datasource URL is missing")
    void shouldFailWhenDatasourceUrlIsMissing() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.username=edupulse_prod_owner"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: 'spring.datasource.url' is mandatory in production profile. Missing database configuration.");
                });
    }

    @Test
    @DisplayName("11. Production profile fails fast if datasource username is missing")
    void shouldFailWhenDatasourceUsernameIsMissing() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "spring.datasource.url=jdbc:postgresql://ep-test.aws.neon.tech:5432/edupulse_prod?sslmode=require"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .hasRootCauseMessage("FATAL CONFIGURATION ERROR: 'spring.datasource.username' is mandatory in production profile. Missing database credentials.");
                });
    }

    @Test
    @DisplayName("12. Safety validator is dormant in dev and test profiles")
    void shouldBeDormantInDevAndTestProfiles() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=test",
                        "spring.datasource.url=jdbc:h2:mem:test_db"
                )
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean(ProductionSafetyValidator.class);
                });
    }
}
