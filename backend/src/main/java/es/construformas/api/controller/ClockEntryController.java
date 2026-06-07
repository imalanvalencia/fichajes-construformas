package es.construformas.api.controller;

import es.construformas.api.dto.ClockEntryDTO;
import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.ClockType;
import es.construformas.api.model.User;
import es.construformas.api.model.Project;
import es.construformas.api.service.ClockEntryService;
import es.construformas.api.service.ClockCorrectionService;
import es.construformas.api.service.UserService;
import es.construformas.api.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clock-entries")
@Tag(name = "Clock Entries", description = "Clock-in/out management endpoints")
public class ClockEntryController {

    private final ClockEntryService clockEntryService;
    private final ClockCorrectionService correctionService;
    private final UserService userService;
    private final ProjectService projectService;

    public ClockEntryController(ClockEntryService clockEntryService,
                                ClockCorrectionService correctionService,
                                UserService userService,
                                ProjectService projectService) {
        this.clockEntryService = clockEntryService;
        this.correctionService = correctionService;
        this.userService = userService;
        this.projectService = projectService;
    }

    @PostMapping
    @Operation(summary = "Register a new clock-in/out entry")
    public ResponseEntity<?> register(@Valid @RequestBody ClockEntryDTO dto) {
        User user = userService.findById(dto.getUserId())
                .orElse(null);
        Project project = projectService.findById(dto.getProjectId())
                .orElse(null);

        if (user == null || project == null) {
            return ResponseEntity.badRequest()
                    .body("User or project not found");
        }

        if (dto.getClockType() == ClockType.ENTRY) {
            boolean hasMissing = correctionService.hasMissingClockOut(
                    dto.getUserId(), LocalDateTime.now().toLocalDate());
            if (hasMissing) {
                return ResponseEntity.badRequest()
                        .body("You have a missing clock-out. Please submit a correction request first.");
            }
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
    @Operation(summary = "Get clock entries for a user within date range")
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
    @Operation(summary = "Get clock entries for a project within date range")
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
    @Operation(summary = "Delete a clock entry")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            clockEntryService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
