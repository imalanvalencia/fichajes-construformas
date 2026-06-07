package es.construformas.api.repository;

import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.ClockType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClockEntryRepository extends JpaRepository<ClockEntry, Long> {

    @Query("SELECT c FROM ClockEntry c WHERE c.user.id = :userId " +
           "AND c.timestamp BETWEEN :start AND :end " +
           "ORDER BY c.timestamp ASC")
    List<ClockEntry> findByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT c FROM ClockEntry c WHERE c.project.id = :projectId " +
           "AND c.timestamp BETWEEN :start AND :end " +
           "ORDER BY c.timestamp ASC")
    List<ClockEntry> findByProjectAndDateRange(
            @Param("projectId") Long projectId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<ClockEntry> findByUserIdAndClockType(
            Long userId, ClockType clockType);
}
