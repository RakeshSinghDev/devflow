# Stage 1: Build stage with Java 21 JDK and Maven wrapper
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper and POM dependencies
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Grant execution permissions on Maven wrapper
RUN chmod +x ./mvnw

# Copy application source code
COPY src/ ./src/

# Package the application executable JAR
RUN ./mvnw clean package -DskipTests

# Stage 2: Production runtime stage with Java 21 JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled Spring Boot executable JAR from build stage
COPY --from=builder /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# Expose default HTTP port
EXPOSE 8080

# Environment variables (Render injects PORT dynamically at runtime)
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

# Run executable JAR with active prod profile
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE}", "-jar", "app.jar"]
