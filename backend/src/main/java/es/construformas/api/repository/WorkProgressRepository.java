package es.construformas.api.repository;

import es.construformas.api.model.WorkProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkProgressRepository extends JpaRepository<WorkProgress, Long> {
    List<WorkProgress> findByProjectIdOrderByProgressDateDesc(Long projectId);
    List<WorkProgress> findByReportedByIdOrderByProgressDateDesc(Long userId);
    Optional<WorkProgress> findTopByProjectIdOrderByProgressDateDesc(Long projectId);
}
