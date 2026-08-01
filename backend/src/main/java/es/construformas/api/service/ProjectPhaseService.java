package es.construformas.api.service;

import es.construformas.api.model.PhaseStatus;
import es.construformas.api.model.Project;
import es.construformas.api.model.ProjectPhase;
import es.construformas.api.repository.ProjectPhaseRepository;
import es.construformas.api.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectPhaseService {

    private final ProjectPhaseRepository projectPhaseRepository;
    private final ProjectRepository projectRepository;

    public ProjectPhase create(ProjectPhase phase) {
        Project project = projectRepository.findById(phase.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        phase.setProject(project);
        if (phase.getStatus() == null) phase.setStatus(PhaseStatus.PENDING);
        if (phase.getOrderNum() == null) phase.setOrderNum(0);
        return projectPhaseRepository.save(phase);
    }

    public List<ProjectPhase> findByProject(Long projectId) {
        return projectPhaseRepository.findByProjectIdOrderByOrderNum(projectId);
    }

    public ProjectPhase updateStatus(Long id, PhaseStatus newStatus) {
        ProjectPhase phase = projectPhaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Phase not found"));
        phase.setStatus(newStatus);
        return projectPhaseRepository.save(phase);
    }

    public void delete(Long id) {
        projectPhaseRepository.deleteById(id);
    }
}
