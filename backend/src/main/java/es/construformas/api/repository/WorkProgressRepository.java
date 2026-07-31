package es.construformas.api.repository;

import es.construformas.api.model.WorkProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkProgressRepository extends JpaRepository<WorkProgress, Long> {
    List<WorkProgress> findByProjectIdOrderByProgressDateDesc(Long projectId);
    Optional<WorkProgress> findTopByProjectIdOrderByProgressDateDesc(Long projectId);
}
