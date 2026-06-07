package es.construformas.api.controller;

import es.construformas.api.dto.ProjectDTO;
import es.construformas.api.model.Project;
import es.construformas.api.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Construction project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<Project> create(@Valid @RequestBody ProjectDTO dto) {
        Project project = Project.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .allowedRadiusMeters(
                    dto.getAllowedRadiusMeters() != null
                        ? dto.getAllowedRadiusMeters() : 50)
                .active(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.create(project));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<Project> findById(@PathVariable Long id) {
        return projectService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all projects")
    public ResponseEntity<List<Project>> findAll() {
        return ResponseEntity.ok(projectService.findAll());
    }

    @GetMapping("/search")
    @Operation(summary = "Search projects by name")
    public ResponseEntity<List<Project>> findByName(
            @RequestParam String name) {
        return ResponseEntity.ok(projectService.findByName(name));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing project")
    public ResponseEntity<Project> update(
            @PathVariable Long id, @Valid @RequestBody ProjectDTO dto) {
        try {
            Project project = Project.builder()
                    .name(dto.getName())
                    .address(dto.getAddress())
                    .latitude(dto.getLatitude())
                    .longitude(dto.getLongitude())
                    .allowedRadiusMeters(dto.getAllowedRadiusMeters())
                    .active(dto.isActive())
                    .build();

            return ResponseEntity.ok(projectService.update(id, project));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            projectService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
