package es.construformas.api.repository;

import es.construformas.api.model.ClockCorrection;
import es.construformas.api.model.ClockType;
import es.construformas.api.model.CorrectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ClockCorrectionRepository extends JpaRepository<ClockCorrection, Long> {
    List<ClockCorrection> findByUserIdAndStatus(Long userId, CorrectionStatus status);
    List<ClockCorrection> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ClockCorrection> findByStatus(CorrectionStatus status);
    boolean existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(Long userId, LocalDate date, ClockType type, CorrectionStatus status);
}
