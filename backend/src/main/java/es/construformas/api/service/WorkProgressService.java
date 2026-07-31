package es.construformas.api.service;

import es.construformas.api.model.Project;
import es.construformas.api.model.User;
import es.construformas.api.model.WorkProgress;
import es.construformas.api.repository.ProjectRepository;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.repository.WorkProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkProgressService {

    private final WorkProgressRepository workProgressRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public WorkProgress create(WorkProgress progress) {
        Project project = projectRepository.findById(progress.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User reporter = userRepository.findById(progress.getReportedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        progress.setProject(project);
        progress.setReportedBy(reporter);
        return workProgressRepository.save(progress);
    }

    public List<WorkProgress> findByProject(Long projectId) {
        return workProgressRepository.findByProjectIdOrderByProgressDateDesc(projectId);
    }

    public Optional<WorkProgress> findLatest(Long projectId) {
        return workProgressRepository.findTopByProjectIdOrderByProgressDateDesc(projectId);
    }
}
