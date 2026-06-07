package es.construformas.api.controller;

import es.construformas.api.dto.ClockEntryDTO;
import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.ClockType;
import es.construformas.api.model.User;
import es.construformas.api.model.Project;
import es.construformas.api.service.ClockEntryService;
import es.construformas.api.service.UserService;
import es.construformas.api.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clock-entries")
public class ClockEntryController {

    private final ClockEntryService clockEntryService;
    private final UserService userService;
    private final ProjectService projectService;

    public ClockEntryController(ClockEntryService clockEntryService,
                                UserService userService,
                                ProjectService projectService) {
        this.clockEntryService = clockEntryService;
        this.userService = userService;
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<?> register(@Valid @RequestBody ClockEntryDTO dto) {
        User user = userService.findById(dto.getUserId())
                .orElse(null);
        Project project = projectService.findById(dto.getProjectId())
                .orElse(null);

        if (user == null || project == null) {
            return ResponseEntity.badRequest()
                    .body("User or project not found");
        }

        ClockEntry clockEntry = ClockEntry.builder()
                .user(user)
                .project(project)
                .clockType(dto.getClockType())
                .userLatitude(dto.getLatitude())
                .userLongitude(dto.getLongitude())
                .notes(dto.getNotes())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clockEntryService.register(clockEntry));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClockEntry>> findByUser(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                LocalDateTime end) {
        return ResponseEntity.ok(
                clockEntryService.findByUserAndDateRange(userId, start, end));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ClockEntry>> findByProject(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                LocalDateTime end) {
        return ResponseEntity.ok(
                clockEntryService.findByProjectAndDateRange(projectId, start, end));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            clockEntryService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
