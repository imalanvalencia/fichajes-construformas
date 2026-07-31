package es.construformas.api.controller;

import es.construformas.api.model.ClockEntry;
import es.construformas.api.service.ClockEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clock-entries")
@RequiredArgsConstructor
public class ClockEntryController {
    private final ClockEntryService clockEntryService;

    @PostMapping
    public ResponseEntity<ClockEntry> register(@Valid @RequestBody ClockEntry entry) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clockEntryService.register(entry));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClockEntry> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clockEntryService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClockEntry>> getByUser(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(clockEntryService.findByUserAndDateRange(userId, start, end));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clockEntryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
