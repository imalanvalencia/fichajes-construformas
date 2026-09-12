package es.construformas.api.repository;

import es.construformas.api.model.PhaseStatus;
import es.construformas.api.model.ProjectPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectPhaseRepository extends JpaRepository<ProjectPhase, Long> {
    List<ProjectPhase> findByProjectIdOrderByOrderNum(Long projectId);
    List<ProjectPhase> findByProjectIdAndStatus(Long projectId, PhaseStatus status);
}
