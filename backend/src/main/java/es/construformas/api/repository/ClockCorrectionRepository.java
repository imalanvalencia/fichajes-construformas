package es.construformas.api.repository;

import es.construformas.api.model.ClockCorrection;
import es.construformas.api.model.CorrectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClockCorrectionRepository extends JpaRepository<ClockCorrection, Long> {

    List<ClockCorrection> findByUserIdAndStatus(
            Long userId, CorrectionStatus status);

    List<ClockCorrection> findByStatus(CorrectionStatus status);

    boolean existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(
            Long userId, LocalDate date,
            es.construformas.api.model.ClockType clockType,
            CorrectionStatus status);
}
