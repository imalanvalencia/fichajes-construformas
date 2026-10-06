package es.construformas.api.health;

import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.time.Instant;

/**
 * Reports application uptime and availability states as a health component.
 * Bean name {@code applicationUptimeHealthIndicator} is exposed by Actuator as
 * {@code applicationUptime} (standard {@code HealthIndicator} suffix stripped).
 * Status is always UP: readiness/liveness DOWN is already covered by the
 * built-in readinessState/livenessState indicators.
 */
@Component("applicationUptimeHealthIndicator")
public class UptimeHealthIndicator implements HealthIndicator {

    private final ApplicationLifecycleListener lifecycleListener;
    private final ApplicationAvailability applicationAvailability;
    private final Instant startedAt;

    public UptimeHealthIndicator(ApplicationLifecycleListener lifecycleListener,
                                 ApplicationAvailability applicationAvailability) {
        this.lifecycleListener = lifecycleListener;
        this.applicationAvailability = applicationAvailability;
        this.startedAt = Instant.ofEpochMilli(ManagementFactory.getRuntimeMXBean().getStartTime());
    }

    @Override
    public Health health() {
        Instant readyAt = lifecycleListener.readyAt();
        Health.Builder builder = Health.up()
                .withDetail("startedAt", startedAt.toString())
                .withDetail("uptimeSeconds", uptimeSeconds())
                .withDetail("readiness", applicationAvailability.getReadinessState())
                .withDetail("liveness", applicationAvailability.getLivenessState());
        if (readyAt != null) {
            builder.withDetail("readyAt", readyAt.toString());
        }
        return builder.build();
    }

    private double uptimeSeconds() {
        return (System.currentTimeMillis() - startedAt.toEpochMilli()) / 1000.0;
    }
}
