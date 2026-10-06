package es.construformas.api.health;

import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * Ensures the application context uses {@link BufferingApplicationStartup} so the
 * Actuator {@code /startup} endpoint can be registered (Spring Boot 4 no longer
 * exposes a property for this; it must be configured on the context).
 */
public class BufferingApplicationStartupInitializer
        implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    public static final int CAPACITY = 2048;

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        if (context.getApplicationStartup() instanceof BufferingApplicationStartup existing) {
            context.getBeanFactory().registerSingleton("bufferingApplicationStartup", existing);
            return;
        }
        BufferingApplicationStartup startup = new BufferingApplicationStartup(CAPACITY);
        context.setApplicationStartup(startup);
        context.getBeanFactory().registerSingleton("bufferingApplicationStartup", startup);
    }
}
