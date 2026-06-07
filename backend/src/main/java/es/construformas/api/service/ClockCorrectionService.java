package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.ClockCorrectionRepository;
import es.construformas.api.repository.ClockEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ClockCorrectionService {

    private final ClockCorrectionRepository correctionRepository;
    private final ClockEntryRepository clockEntryRepository;

    public ClockCorrectionService(ClockCorrectionRepository correctionRepository,
                                  ClockEntryRepository clockEntryRepository) {
        this.correctionRepository = correctionRepository;
        this.clockEntryRepository = clockEntryRepository;
    }

    public ClockCorrection requestCorrection(ClockCorrection correction) {
        boolean hasPending = correctionRepository
                .existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(
                        correction.getUser().getId(),
                        correction.getCorrectionDate(),
                        correction.getOriginalClockType(),
                        CorrectionStatus.PENDING);

        if (hasPending) {
            throw new IllegalArgumentException(
                    "You already have a pending correction for this date and type");
        }

        return correctionRepository.save(correction);
    }

    @Transactional(readOnly = true)
    public List<ClockCorrection> findByUser(Long userId) {
        return correctionRepository.findByUserIdAndStatus(
                userId, CorrectionStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<ClockCorrection> findPending() {
        return correctionRepository.findByStatus(CorrectionStatus.PENDING);
    }

    public ClockCorrection approve(Long correctionId, Long reviewerId) {
        ClockCorrection correction = correctionRepository.findById(correctionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Correction not found: " + correctionId));

        if (correction.getStatus() != CorrectionStatus.PENDING) {
            throw new IllegalArgumentException("Correction is not pending");
        }

        correction.setStatus(CorrectionStatus.APPROVED);
        correction.setReviewedAt(LocalDateTime.now());

        ClockEntry newEntry = ClockEntry.builder()
                .user(correction.getUser())
                .project(correction.getProject())
                .clockType(correction.getOriginalClockType())
                .timestamp(correction.getCorrectedTime())
                .notes("Approved correction: " + correction.getReason())
                .build();

        clockEntryRepository.save(newEntry);

        return correctionRepository.save(correction);
    }

    public ClockCorrection reject(Long correctionId, Long reviewerId) {
        ClockCorrection correction = correctionRepository.findById(correctionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Correction not found: " + correctionId));

        if (correction.getStatus() != CorrectionStatus.PENDING) {
            throw new IllegalArgumentException("Correction is not pending");
        }

        correction.setStatus(CorrectionStatus.REJECTED);
        correction.setReviewedAt(LocalDateTime.now());

        return correctionRepository.save(correction);
    }

    @Transactional(readOnly = true)
    public boolean hasMissingClockOut(Long userId, LocalDate date) {
        List<ClockEntry> entries = clockEntryRepository
                .findByUserAndDateRange(userId,
                        date.atStartOfDay(),
                        date.plusDays(1).atStartOfDay());

        long entriesCount = entries.stream()
                .filter(e -> e.getClockType() == ClockType.ENTRY)
                .count();
        long exitsCount = entries.stream()
                .filter(e -> e.getClockType() == ClockType.EXIT)
                .count();

        return entriesCount > exitsCount;
    }
}
