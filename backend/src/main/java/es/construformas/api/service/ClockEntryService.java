package es.construformas.api.service;

import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.ClockType;
import es.construformas.api.repository.ClockEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ClockEntryService {

    private final ClockEntryRepository clockEntryRepository;

    public ClockEntryService(ClockEntryRepository clockEntryRepository) {
        this.clockEntryRepository = clockEntryRepository;
    }

    public ClockEntry register(ClockEntry clockEntry) {
        return clockEntryRepository.save(clockEntry);
    }

    @Transactional(readOnly = true)
    public List<ClockEntry> findByUserAndDateRange(
            Long userId, LocalDateTime start, LocalDateTime end) {
        return clockEntryRepository.findByUserAndDateRange(userId, start, end);
    }

    @Transactional(readOnly = true)
    public List<ClockEntry> findByProjectAndDateRange(
            Long projectId, LocalDateTime start, LocalDateTime end) {
        return clockEntryRepository.findByProjectAndDateRange(projectId, start, end);
    }

    @Transactional(readOnly = true)
    public List<ClockEntry> findByType(Long userId, ClockType type) {
        return clockEntryRepository.findByUserIdAndClockType(userId, type);
    }

    public void delete(Long id) {
        if (!clockEntryRepository.existsById(id)) {
            throw new IllegalArgumentException("Clock entry not found: " + id);
        }
        clockEntryRepository.deleteById(id);
    }
}
