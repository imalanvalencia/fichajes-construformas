package es.construformas.api.controller;

import es.construformas.api.model.ClockCorrection;
import es.construformas.api.service.ClockCorrectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clock-corrections")
@RequiredArgsConstructor
public class ClockCorrectionController {
    private final ClockCorrectionService clockCorrectionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ClockCorrection> requestCorrection(@Valid @RequestBody ClockCorrection correction) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clockCorrectionService.requestCorrection(correction));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClockCorrection>> getPending() {
        return ResponseEntity.ok(clockCorrectionService.findPending());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<ClockCorrection>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(clockCorrectionService.findByUser(userId));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClockCorrection> approve(@PathVariable Long id, @RequestParam Long reviewerId) {
        return ResponseEntity.ok(clockCorrectionService.approve(id, reviewerId));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClockCorrection> reject(@PathVariable Long id, @RequestParam Long reviewerId) {
        return ResponseEntity.ok(clockCorrectionService.reject(id, reviewerId));
    }
}
