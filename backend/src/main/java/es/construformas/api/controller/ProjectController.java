package es.construformas.api.controller;

import es.construformas.api.dto.ProjectFinancialSummaryDTO;
import es.construformas.api.model.Project;
import es.construformas.api.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> create(@Valid @RequestBody Project project) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(project));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<Project>> getAll() {
        return ResponseEntity.ok(projectService.findAll());
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<Project>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(projectService.findByClient(clientId));
    }

    @GetMapping("/{id}/financial-summary")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ProjectFinancialSummaryDTO> getFinancialSummary(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getFinancialSummary(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> update(@PathVariable Long id, @RequestBody Project project) {
        return ResponseEntity.ok(projectService.update(id, project));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
