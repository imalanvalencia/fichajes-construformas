package es.construformas.api.repository;

import es.construformas.api.model.Project;
import es.construformas.api.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientId(Long clientId);
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByActive(boolean active);
    List<Project> findByNameContainingIgnoreCase(String name);
}
