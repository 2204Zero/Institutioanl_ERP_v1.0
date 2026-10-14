# ==============================================================================
# EduPulse Backend Dockerfile
# Stage 1: Build application JAR using Maven & Java 21
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build

WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and build production artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 2: Minimal Java 21 Runtime Image
# ==============================================================================
FROM eclipse-temurin:21-jre-jammy

# Install curl for container health checks
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root user and group
RUN groupadd -g 1001 edupulse \
    && useradd -u 1001 -g edupulse -s /bin/sh -d /app edupulse

# Create predictable app and persistent storage directories with non-root ownership
RUN mkdir -p /app /var/lib/edupulse/data \
    && chown -R edupulse:edupulse /app /var/lib/edupulse/data

WORKDIR /app

# Copy executable jar from build stage
COPY --from=build --chown=edupulse:edupulse /app/target/institutional-erp-backend-1.0.0-SNAPSHOT.jar /app/app.jar

# Switch to non-root user
USER edupulse:edupulse

# Expose backend application port
EXPOSE 8081

# Container environment defaults
ENV SPRING_PROFILES_ACTIVE=dev-json \
    ERP_DEVJSON_STORAGE_DIR=/var/lib/edupulse/data \
    APP_STORAGE_DOCUMENT_DIR=/var/lib/edupulse/data/uploads

# Container-aware JVM memory options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Djava.security.egd=file:/dev/./urandom"

# Health check against dedicated liveness endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8081/api/health || exit 1

# Graceful termination handling: exec ensures java receives SIGTERM directly
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]