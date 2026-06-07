package es.construformas.api.controller;

import es.construformas.api.dto.ClockCorrectionDTO;
import es.construformas.api.model.*;
import es.construformas.api.repository.ClockEntryRepository;
import es.construformas.api.service.ClockCorrectionService;
import es.construformas.api.service.UserService;
import es.construformas.api.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clock-corrections")
@Tag(name = "Clock Corrections", description = "Manual correction request endpoints")
public class ClockCorrectionController {

    private final ClockCorrectionService correctionService;
    private final ClockEntryRepository clockEntryRepository;
    private final UserService userService;
    private final ProjectService projectService;

    public ClockCorrectionController(ClockCorrectionService correctionService,
                                     ClockEntryRepository clockEntryRepository,
                                     UserService userService,
                                     ProjectService projectService) {
        this.correctionService = correctionService;
        this.clockEntryRepository = clockEntryRepository;
        this.userService = userService;
        this.projectService = projectService;
    }

    @PostMapping
    @Operation(summary = "Request a clock correction")
    public ResponseEntity<?> requestCorrection(
            @Valid @RequestBody ClockCorrectionDTO dto) {
        User user = userService.findById(dto.getUserId()).orElse(null);
        Project project = projectService.findById(dto.getProjectId()).orElse(null);

        if (user == null || project == null) {
            return ResponseEntity.badRequest()
                    .body("User or project not found");
        }

        ClockEntry originalEntry = null;
        if (dto.getOriginalEntryId() != null) {
            originalEntry = clockEntryRepository.findById(dto.getOriginalEntryId())
                    .orElse(null);
        }

        ClockCorrection correction = ClockCorrection.builder()
                .user(user)
                .project(project)
                .originalEntry(originalEntry)
                .correctionDate(dto.getCorrectionDate())
                .originalClockType(dto.getOriginalClockType())
                .correctedTime(dto.getCorrectedTime())
                .reason(dto.getReason())
                .build();

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(correctionService.requestCorrection(correction));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get pending corrections for a user")
    public ResponseEntity<List<ClockCorrection>> findByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(correctionService.findByUser(userId));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get all pending corrections (admin)")
    public ResponseEntity<List<ClockCorrection>> findPending() {
        return ResponseEntity.ok(correctionService.findPending());
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve a correction request (admin)")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            @RequestParam Long reviewerId) {
        try {
            return ResponseEntity.ok(
                    correctionService.approve(id, reviewerId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject a correction request (admin)")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestParam Long reviewerId) {
        try {
            return ResponseEntity.ok(
                    correctionService.reject(id, reviewerId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
