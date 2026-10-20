package es.construformas.api.controller;

import es.construformas.api.dto.ClockCorrectionDTO;
import es.construformas.api.dto.ClockCorrectionMapper;
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
    public ResponseEntity<ClockCorrectionDTO> requestCorrection(
            @Valid @RequestBody ClockCorrectionDTO dto) {
        ClockCorrection correction = clockCorrectionService.requestCorrection(
                ClockCorrectionMapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(ClockCorrectionMapper.toDto(correction));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClockCorrectionDTO>> getPending() {
        return ResponseEntity.ok(clockCorrectionService.findPending().stream()
                .map(ClockCorrectionMapper::toDto)
                .toList());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<ClockCorrectionDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(clockCorrectionService.findByUser(userId).stream()
                .map(ClockCorrectionMapper::toDto)
                .toList());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClockCorrectionDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ClockCorrectionMapper.toDto(clockCorrectionService.approve(id)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClockCorrectionDTO> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ClockCorrectionMapper.toDto(clockCorrectionService.reject(id)));
    }
}
