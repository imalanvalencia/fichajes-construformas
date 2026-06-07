package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.ClockCorrectionRepository;
import es.construformas.api.repository.ClockEntryRepository;
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
    @DisplayName("hasMissingClockOut: ENTRY without EXIT should return true")
    void hasMissingClockOut_entryWithoutExit_shouldReturnTrue() {
        ClockEntry entry = ClockEntry.builder()
                .clockType(ClockType.ENTRY)
                .timestamp(LocalDateTime.now())
                .build();

        when(clockEntryRepository.findByUserAndDateRange(
                any(), any(), any()))
                .thenReturn(List.of(entry));

        boolean result = correctionService.hasMissingClockOut(
                1L, LocalDate.now());

        assertTrue(result);
    }

    @Test
    @DisplayName("hasMissingClockOut: ENTRY + EXIT should return false")
    void hasMissingClockOut_entryWithExit_shouldReturnFalse() {
        ClockEntry entry = ClockEntry.builder()
                .clockType(ClockType.ENTRY).build();
        ClockEntry exit = ClockEntry.builder()
                .clockType(ClockType.EXIT).build();

        when(clockEntryRepository.findByUserAndDateRange(
                any(), any(), any()))
                .thenReturn(List.of(entry, exit));

        boolean result = correctionService.hasMissingClockOut(
                1L, LocalDate.now());

        assertFalse(result);
    }

    @Test
    @DisplayName("hasMissingClockOut: no entries should return false")
    void hasMissingClockOut_noEntries_shouldReturnFalse() {
        when(clockEntryRepository.findByUserAndDateRange(
                any(), any(), any()))
                .thenReturn(List.of());

        boolean result = correctionService.hasMissingClockOut(
                1L, LocalDate.now());

        assertFalse(result);
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
        when(correctionRepository.save(any())).thenReturn(correction);
        when(clockEntryRepository.save(any())).thenReturn(null);

        ClockCorrection result = correctionService.approve(1L, 1L);

        assertEquals(CorrectionStatus.APPROVED, result.getStatus());
    }

    @Test
    @DisplayName("approve: non-pending correction should throw")
    void approve_nonPendingCorrection_shouldThrow() {
        ClockCorrection correction = ClockCorrection.builder()
                .id(1L)
                .status(CorrectionStatus.APPROVED)
                .build();

        when(correctionRepository.findById(1L))
                .thenReturn(Optional.of(correction));

        assertThrows(IllegalArgumentException.class,
                () -> correctionService.approve(1L, 1L));
    }

    @Test
    @DisplayName("reject: pending correction should update status")
    void reject_pendingCorrection_shouldUpdateStatus() {
        ClockCorrection correction = ClockCorrection.builder()
                .id(1L)
                .status(CorrectionStatus.PENDING)
                .build();

        when(correctionRepository.findById(1L))
                .thenReturn(Optional.of(correction));
        when(correctionRepository.save(any())).thenReturn(correction);

        ClockCorrection result = correctionService.reject(1L, 1L);

        assertEquals(CorrectionStatus.REJECTED, result.getStatus());
    }
}
