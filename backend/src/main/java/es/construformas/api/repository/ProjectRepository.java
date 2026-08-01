package es.construformas.api.repository;

import es.construformas.api.model.Project;
import es.construformas.api.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientId(Long clientId);
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByActive(boolean active);
    List<Project> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Project p JOIN p.operators o WHERE o.id = :userId")
    List<Project> findByOperatorId(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) > 0 FROM Project p JOIN p.operators o WHERE p.id = :projectId AND o.id = :userId")
    boolean existsByProjectIdAndOperatorId(@Param("projectId") Long projectId, @Param("userId") Long userId);
}
