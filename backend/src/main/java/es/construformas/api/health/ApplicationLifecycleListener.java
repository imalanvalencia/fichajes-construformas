package es.construformas.api.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.AvailabilityState;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Logs application lifecycle transitions (ready, availability changes, shutdown)
 * and exposes the instant the application became ready.
 */
@Component
public class ApplicationLifecycleListener {

    private static final Logger log = LoggerFactory.getLogger(ApplicationLifecycleListener.class);

    private volatile Instant readyAt;
    private volatile AvailabilityState previousAvailabilityState;

    @EventListener
    public void onApplicationReady(ApplicationReadyEvent event) {
        this.readyAt = Instant.now();
        log.info("[lifecycle] [{}] application ready at {}", this.readyAt, this.readyAt);
    }

    @EventListener
    public void onAvailabilityChange(AvailabilityChangeEvent<?> event) {
        AvailabilityState previous = this.previousAvailabilityState;
        this.previousAvailabilityState = event.getState();
        log.info("[lifecycle] [{}] availability changed from {} to {}",
                Instant.now(),
                previous != null ? previous : "unknown",
                event.getState());
    }

    @EventListener
    public void onContextClosed(ContextClosedEvent event) {
        log.info("[lifecycle] [{}] shutdown requested", Instant.now());
    }

    /**
     * @return the instant {@link ApplicationReadyEvent} was received, or {@code null} before ready.
     */
    public Instant readyAt() {
        return readyAt;
    }
}
