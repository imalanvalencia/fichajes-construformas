package es.construformas.api.health;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.LivenessState;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.Status;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link UptimeHealthIndicator}.
 * Pure Mockito — no Spring context, no database.
 */
class UptimeHealthIndicatorTest {

    private final ApplicationLifecycleListener lifecycleListener = new ApplicationLifecycleListener();

    private UptimeHealthIndicator buildIndicator(ApplicationAvailability availability) {
        return new UptimeHealthIndicator(lifecycleListener, availability);
    }

    @Test
    @DisplayName("health() should return UP with startedAt, uptimeSeconds, readiness and liveness details")
    void healthShouldReturnUpWithExpectedDetails() {
        ApplicationAvailability availability = mock(ApplicationAvailability.class);
        when(availability.getReadinessState()).thenReturn(ReadinessState.ACCEPTING_TRAFFIC);
        when(availability.getLivenessState()).thenReturn(LivenessState.CORRECT);

        UptimeHealthIndicator indicator = buildIndicator(availability);
        Health health = indicator.health();

        assertThat(health.getStatus()).isEqualTo(Status.UP);
        assertThat(health.getDetails())
                .containsKey("startedAt")
                .containsKey("uptimeSeconds")
                .containsKey("readiness")
                .containsKey("liveness");
        assertThat(health.getDetails().get("startedAt")).isInstanceOf(String.class);
        assertThat(health.getDetails().get("uptimeSeconds")).isInstanceOf(Double.class);
        assertThat((Double) health.getDetails().get("uptimeSeconds")).isGreaterThanOrEqualTo(0.0);
    }

    @Test
    @DisplayName("health() should omit readyAt before ApplicationReadyEvent")
    void healthShouldOmitReadyAtBeforeReady() {
        ApplicationAvailability availability = mock(ApplicationAvailability.class);
        when(availability.getReadinessState()).thenReturn(ReadinessState.ACCEPTING_TRAFFIC);
        when(availability.getLivenessState()).thenReturn(LivenessState.CORRECT);

        UptimeHealthIndicator indicator = buildIndicator(availability);
        Health health = indicator.health();

        assertThat(health.getDetails()).doesNotContainKey("readyAt");
    }

    @Test
    @DisplayName("health() should include readyAt after ApplicationReadyEvent")
    void healthShouldIncludeReadyAtAfterReady() {
        ApplicationAvailability availability = mock(ApplicationAvailability.class);
        when(availability.getReadinessState()).thenReturn(ReadinessState.ACCEPTING_TRAFFIC);
        when(availability.getLivenessState()).thenReturn(LivenessState.CORRECT);

        var application = org.mockito.Mockito.mock(org.springframework.boot.SpringApplication.class);
        var context = org.mockito.Mockito.mock(org.springframework.context.ConfigurableApplicationContext.class);
        var readyEvent = new org.springframework.boot.context.event.ApplicationReadyEvent(
                application, new String[] {}, context, java.time.Duration.ZERO);
        lifecycleListener.onApplicationReady(readyEvent);

        UptimeHealthIndicator indicator = buildIndicator(availability);
        Health health = indicator.health();

        assertThat(health.getDetails()).containsKey("readyAt");
        assertThat(health.getDetails().get("readyAt")).isEqualTo(lifecycleListener.readyAt().toString());
    }

    @Test
    @DisplayName("Component annotation should map bean name applicationUptimeHealthIndicator to health component applicationUptime")
    void componentAnnotationShouldUseExpectedBeanName() {
        var component = UptimeHealthIndicator.class
                .getAnnotation(org.springframework.stereotype.Component.class);
        assertThat(component).isNotNull();
        assertThat(component.value()).isEqualTo("applicationUptimeHealthIndicator");
    }
}
