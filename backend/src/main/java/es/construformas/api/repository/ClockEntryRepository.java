package es.construformas.api.repository;

import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.ClockType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClockEntryRepository extends JpaRepository<ClockEntry, Long> {
    List<ClockEntry> findByUserIdAndTimestampBetween(Long userId, LocalDateTime start, LocalDateTime end);
    List<ClockEntry> findByUserIdOrderByTimestampDesc(Long userId);
    List<ClockEntry> findByUserIdAndTimestampBetweenOrderByTimestampDesc(Long userId, LocalDateTime start, LocalDateTime end);
    List<ClockEntry> findByProjectIdAndTimestampBetween(Long projectId, LocalDateTime start, LocalDateTime end);
    List<ClockEntry> findByUserIdAndClockType(Long userId, ClockType clockType);

    @Query("SELECT COUNT(ce) FROM ClockEntry ce WHERE ce.user.id = :userId AND ce.clockType = :type AND DATE(ce.timestamp) = :date")
    long countByUserIdAndTypeAndDate(@Param("userId") Long userId, @Param("type") ClockType type, @Param("date") LocalDate date);
}
