package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.ClockCorrectionRepository;
import es.construformas.api.repository.ClockEntryRepository;
import es.construformas.api.repository.ProjectRepository;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClockCorrectionService {

    private final ClockCorrectionRepository clockCorrectionRepository;
    private final ClockEntryRepository clockEntryRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public ClockCorrection requestCorrection(ClockCorrection correction) {
        boolean exists = clockCorrectionRepository.existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(
                correction.getUser().getId(),
                correction.getCorrectionDate(),
                correction.getOriginalClockType(),
                CorrectionStatus.PENDING
        );
        if (exists) {
            throw new IllegalArgumentException("A pending correction already exists for this user, date, and type");
        }

        User user = userRepository.findById(correction.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Project project = projectRepository.findById(correction.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        correction.setUser(user);
        correction.setProject(project);
        if (correction.getStatus() == null) correction.setStatus(CorrectionStatus.PENDING);

        return clockCorrectionRepository.save(correction);
    }

    public ClockCorrection findById(Long id) {
        return clockCorrectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Clock correction not found"));
    }

    public List<ClockCorrection> findAll() {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            return clockCorrectionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return clockCorrectionRepository.findAll();
    }

    public List<ClockCorrection> findPending() {
        return clockCorrectionRepository.findByStatus(CorrectionStatus.PENDING);
    }

    public List<ClockCorrection> findByUser(Long userId) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!user.getId().equals(userId)) {
                throw new IllegalArgumentException("Access denied: cannot view other users' corrections");
            }
        }
        return clockCorrectionRepository.findByUserIdAndStatus(userId, CorrectionStatus.PENDING);
    }

    public ClockCorrection approve(Long correctionId, Long reviewerId) {
        ClockCorrection correction = findById(correctionId);
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer not found"));

        correction.setStatus(CorrectionStatus.APPROVED);
        correction.setReviewedBy(reviewer);
        correction.setReviewedAt(LocalDateTime.now());

        ClockEntry correctedEntry = ClockEntry.builder()
                .user(correction.getUser())
                .project(correction.getProject())
                .clockType(correction.getOriginalClockType())
                .userLatitude(0.0)
                .userLongitude(0.0)
                .timestamp(correction.getCorrectedTime())
                .notes("Corrected via correction request #" + correction.getId())
                .build();
        clockEntryRepository.save(correctedEntry);

        return clockCorrectionRepository.save(correction);
    }

    public ClockCorrection reject(Long correctionId, Long reviewerId) {
        ClockCorrection correction = findById(correctionId);
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer not found"));

        correction.setStatus(CorrectionStatus.REJECTED);
        correction.setReviewedBy(reviewer);
        correction.setReviewedAt(LocalDateTime.now());

        return clockCorrectionRepository.save(correction);
    }
}
