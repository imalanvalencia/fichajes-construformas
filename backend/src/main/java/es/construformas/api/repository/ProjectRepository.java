package es.construformas.api.repository;

import es.construformas.api.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByNameContainingIgnoreCase(String name);

    List<Project> findByAddressContainingIgnoreCase(String address);

    List<Project> findByActive(boolean active);
}
