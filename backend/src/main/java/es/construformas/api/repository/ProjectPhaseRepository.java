package es.construformas.api.repository;

import es.construformas.api.model.PhaseStatus;
import es.construformas.api.model.ProjectPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectPhaseRepository extends JpaRepository<ProjectPhase, Long> {
    List<ProjectPhase> findByProjectIdOrderByOrderNum(Long projectId);
    List<ProjectPhase> findByProjectIdAndStatus(Long projectId, PhaseStatus status);
}
