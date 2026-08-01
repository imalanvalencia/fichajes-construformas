package es.construformas.api.service;

import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.Project;
import es.construformas.api.model.User;
import es.construformas.api.repository.ClockEntryRepository;
import es.construformas.api.repository.ProjectRepository;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.util.HaversineUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClockEntryService {

    private final ClockEntryRepository clockEntryRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public ClockEntry register(ClockEntry entry) {
        User user = userRepository.findById(entry.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Project project = projectRepository.findById(entry.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        if (!HaversineUtil.isWithinRadius(
                entry.getUserLatitude(), entry.getUserLongitude(),
                project.getLatitude(), project.getLongitude(),
                project.getAllowedRadiusMeters())) {
            throw new IllegalArgumentException("User is outside the allowed radius for this project");
        }

        entry.setUser(user);
        entry.setProject(project);
        if (entry.getTimestamp() == null) entry.setTimestamp(LocalDateTime.now());

        return clockEntryRepository.save(entry);
    }

    public ClockEntry findById(Long id) {
        return clockEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Clock entry not found"));
    }

    public List<ClockEntry> findByUserAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return clockEntryRepository.findByUserIdAndTimestampBetween(userId, start, end);
    }

    public List<ClockEntry> findByProjectAndDateRange(Long projectId, LocalDateTime start, LocalDateTime end) {
        return clockEntryRepository.findByProjectIdAndTimestampBetween(projectId, start, end);
    }

    public void delete(Long id) {
        clockEntryRepository.deleteById(id);
    }
}
