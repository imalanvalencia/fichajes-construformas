package es.construformas.api.controller;

import es.construformas.api.dto.ProjectFinancialSummaryDTO;
import es.construformas.api.model.Project;
import es.construformas.api.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> create(@Valid @RequestBody Project project) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(project));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAll() {
        return ResponseEntity.ok(projectService.findAll());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Project>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(projectService.findByClient(clientId));
    }

    @GetMapping("/{id}/financial-summary")
    public ResponseEntity<ProjectFinancialSummaryDTO> getFinancialSummary(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getFinancialSummary(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable Long id, @RequestBody Project project) {
        return ResponseEntity.ok(projectService.update(id, project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
