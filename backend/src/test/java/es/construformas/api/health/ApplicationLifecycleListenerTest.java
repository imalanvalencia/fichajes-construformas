package es.construformas.api.health;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.ContextClosedEvent;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * Unit tests for {@link ApplicationLifecycleListener}.
 * Pure JUnit + logback ListAppender — no Spring context, no database.
 */
class ApplicationLifecycleListenerTest {

    private ApplicationLifecycleListener listener;
    private ListAppender<ILoggingEvent> appender;
    private Logger logger;

    @BeforeEach
    void setUp() {
        listener = new ApplicationLifecycleListener();
        logger = (Logger) LoggerFactory.getLogger(ApplicationLifecycleListener.class);
        appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        logger.setLevel(Level.INFO);
    }

    @AfterEach
    void tearDown() {
        logger.detachAppender(appender);
    }

    @Test
    @DisplayName("readyAt should be null before ApplicationReadyEvent")
    void readyAtShouldBeNullBeforeReady() {
        assertThat(listener.readyAt()).isNull();
    }

    @Test
    @DisplayName("ApplicationReadyEvent should set readyAt and log a [lifecycle] line with ISO-8601 timestamp")
    void applicationReadyEventShouldSetReadyAtAndLog() {
        var application = mock(org.springframework.boot.SpringApplication.class);
        var context = mock(org.springframework.context.ConfigurableApplicationContext.class);
        var event = new ApplicationReadyEvent(application, new String[] {}, context, Duration.ZERO);

        listener.onApplicationReady(event);

        assertThat(listener.readyAt()).isNotNull();
        assertThat(logLines()).anySatisfy(line -> {
            assertThat(line).startsWith("[lifecycle]");
            assertThat(line).contains(listener.readyAt().toString());
        });
    }

    @Test
    @DisplayName("AvailabilityChangeEvent should log each transition from old to new state")
    void availabilityChangeEventShouldLogOldToNewTransition() {
        listener.onAvailabilityChange(new AvailabilityChangeEvent<>(
                this, ReadinessState.REFUSING_TRAFFIC));
        appender.list.clear();
        listener.onAvailabilityChange(new AvailabilityChangeEvent<>(
                this, ReadinessState.ACCEPTING_TRAFFIC));

        assertThat(logLines()).anySatisfy(line -> {
            assertThat(line).startsWith("[lifecycle]");
            assertThat(line).contains(ReadinessState.REFUSING_TRAFFIC.toString());
            assertThat(line).contains(ReadinessState.ACCEPTING_TRAFFIC.toString());
            assertThat(line).matches(".*\\d{4}-\\d{2}-\\d{2}T.*");
        });
    }

    @Test
    @DisplayName("AvailabilityChangeEvent alone should not set readyAt")
    void availabilityChangeEventAloneShouldNotSetReadyAt() {
        listener.onAvailabilityChange(new AvailabilityChangeEvent<>(
                this, ReadinessState.ACCEPTING_TRAFFIC));

        assertThat(listener.readyAt()).isNull();
    }

    @Test
    @DisplayName("ContextClosedEvent should log shutdown requested with [lifecycle] prefix")
    void contextClosedEventShouldLogShutdownRequested() {
        var context = mock(org.springframework.context.ApplicationContext.class);

        listener.onContextClosed(new ContextClosedEvent(context));

        assertThat(logLines()).anySatisfy(line -> {
            assertThat(line).startsWith("[lifecycle]");
            assertThat(line).contains("shutdown requested");
            assertThat(line).matches(".*\\d{4}-\\d{2}-\\d{2}T.*");
        });
    }

    private java.util.List<String> logLines() {
        return appender.list.stream().map(ILoggingEvent::getFormattedMessage).toList();
    }
}
