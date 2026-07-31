package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.ClockCorrectionRepository;
import es.construformas.api.repository.ClockEntryRepository;
import es.construformas.api.repository.ProjectRepository;
import es.construformas.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClockCorrectionServiceTest {

    @Mock
    private ClockCorrectionRepository correctionRepository;
    @Mock
    private ClockEntryRepository clockEntryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ClockCorrectionService correctionService;

    private User user;
    private Project project;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).name("Test").build();
        project = Project.builder().id(1L).name("Obra").build();
    }

    @Test
    @DisplayName("requestCorrection: duplicate pending should throw")
    void requestCorrection_duplicatePending_shouldThrow() {
        ClockCorrection correction = ClockCorrection.builder()
                .user(user)
                .project(project)
                .correctionDate(LocalDate.now())
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.now())
                .reason("Test")
                .build();

        when(correctionRepository
                .existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(
                        any(), any(), any(), any()))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> correctionService.requestCorrection(correction));
    }

    @Test
    @DisplayName("requestCorrection: new correction should save")
    void requestCorrection_new_shouldSave() {
        ClockCorrection correction = ClockCorrection.builder()
                .user(user)
                .project(project)
                .correctionDate(LocalDate.now())
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.now())
                .reason("Test")
                .build();

        when(correctionRepository
                .existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(
                        any(), any(), any(), any()))
                .thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(correctionRepository.save(any())).thenReturn(correction);

        ClockCorrection result = correctionService.requestCorrection(correction);

        assertEquals(CorrectionStatus.PENDING, result.getStatus());
    }

    @Test
    @DisplayName("approve: pending correction should create new entry")
    void approve_pendingCorrection_shouldCreateEntry() {
        ClockCorrection correction = ClockCorrection.builder()
                .id(1L)
                .user(user)
                .project(project)
                .status(CorrectionStatus.PENDING)
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.now())
                .reason("Forgot to clock in")
                .build();

        when(correctionRepository.findById(1L))
                .thenReturn(Optional.of(correction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(correctionRepository.save(any())).thenReturn(correction);
        when(clockEntryRepository.save(any())).thenReturn(null);

        ClockCorrection result = correctionService.approve(1L, 1L);

        assertEquals(CorrectionStatus.APPROVED, result.getStatus());
    }

    @Test
    @DisplayName("reject: pending correction should update status")
    void reject_pendingCorrection_shouldUpdateStatus() {
        ClockCorrection correction = ClockCorrection.builder()
                .id(1L)
                .user(user)
                .project(project)
                .status(CorrectionStatus.PENDING)
                .build();

        when(correctionRepository.findById(1L))
                .thenReturn(Optional.of(correction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(correctionRepository.save(any())).thenReturn(correction);

        ClockCorrection result = correctionService.reject(1L, 1L);

        assertEquals(CorrectionStatus.REJECTED, result.getStatus());
    }
}
