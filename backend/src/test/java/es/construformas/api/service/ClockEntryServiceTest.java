package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.ClockEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClockEntryServiceTest {

    @Mock
    private ClockEntryRepository clockEntryRepository;

    @InjectMocks
    private ClockEntryService clockEntryService;

    // Barcelona project location
    private static final double PROJECT_LAT = 41.3874;
    private static final double PROJECT_LON = 2.1686;
    private static final int RADIUS_METERS = 50;

    private Project project;
    private User user;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .name("Obra Barcelona")
                .latitude(PROJECT_LAT)
                .longitude(PROJECT_LON)
                .allowedRadiusMeters(RADIUS_METERS)
                .active(true)
                .build();

        user = User.builder()
                .id(1L)
                .name("Operario Test")
                .email("test@construformas.com")
                .role(UserRole.OPERATOR)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("ENTRY at 10m from project - should succeed")
    void registerEntry_withinRadius_shouldSucceed() {
        // ~10m north of project
        ClockEntry entry = ClockEntry.builder()
                .user(user)
                .project(project)
                .clockType(ClockType.ENTRY)
                .userLatitude(PROJECT_LAT + 0.0001)
                .userLongitude(PROJECT_LON)
                .build();

        when(clockEntryRepository.save(any(ClockEntry.class)))
                .thenReturn(entry);

        ClockEntry result = clockEntryService.register(entry);

        assertNotNull(result);
        assertEquals(ClockType.ENTRY, result.getClockType());
    }

    @Test
    @DisplayName("ENTRY at 70m from project - should be rejected")
    void registerEntry_outsideRadius_shouldThrow() {
        // ~70m north of project
        ClockEntry entry = ClockEntry.builder()
                .user(user)
                .project(project)
                .clockType(ClockType.ENTRY)
                .userLatitude(PROJECT_LAT + 0.00063)
                .userLongitude(PROJECT_LON)
                .build();

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> clockEntryService.register(entry));

        assertTrue(ex.getMessage().contains("outside the allowed radius"));
    }
}
