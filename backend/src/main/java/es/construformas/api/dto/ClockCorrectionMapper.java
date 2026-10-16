package es.construformas.api.dto;

import es.construformas.api.model.ClockCorrection;
import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.ClockType;
import es.construformas.api.model.Project;
import es.construformas.api.model.User;

/**
 * Maps between the flat {@link ClockCorrectionDTO} wire contract and the JPA
 * {@link ClockCorrection} entity. The review outcome (status, reviewer, reviewedAt)
 * is never read from the client: the service assigns it.
 */
public final class ClockCorrectionMapper {

    private ClockCorrectionMapper() {
    }

    public static ClockCorrectionDTO toDto(ClockCorrection correction) {
        if (correction == null) return null;
        return ClockCorrectionDTO.builder()
                .id(correction.getId())
                .userId(correction.getUser() != null ? correction.getUser().getId() : null)
                .userName(correction.getUser() != null ? correction.getUser().getName() : null)
                .projectId(correction.getProject() != null ? correction.getProject().getId() : null)
                .projectName(correction.getProject() != null ? correction.getProject().getName() : null)
                .originalEntryId(correction.getOriginalEntry() != null ? correction.getOriginalEntry().getId() : null)
                .correctionDate(correction.getCorrectionDate())
                .originalClockType(
                        correction.getOriginalClockType() != null ? correction.getOriginalClockType().name() : null)
                .correctedTime(correction.getCorrectedTime())
                .reason(correction.getReason())
                .status(correction.getStatus() != null ? correction.getStatus().name() : null)
                .reviewedById(correction.getReviewedBy() != null ? correction.getReviewedBy().getId() : null)
                .reviewedByName(correction.getReviewedBy() != null ? correction.getReviewedBy().getName() : null)
                .reviewedAt(correction.getReviewedAt())
                .createdAt(correction.getCreatedAt())
                .build();
    }

    public static ClockCorrection toEntity(ClockCorrectionDTO dto) {
        if (dto == null) return null;
        return ClockCorrection.builder()
                .user(dto.getUserId() != null ? User.builder().id(dto.getUserId()).build() : null)
                .project(dto.getProjectId() != null ? Project.builder().id(dto.getProjectId()).build() : null)
                .originalEntry(dto.getOriginalEntryId() != null
                        ? ClockEntry.builder().id(dto.getOriginalEntryId()).build()
                        : null)
                .correctionDate(dto.getCorrectionDate())
                .originalClockType(dto.getOriginalClockType() != null
                        ? ClockType.valueOf(dto.getOriginalClockType())
                        : null)
                .correctedTime(dto.getCorrectedTime())
                .reason(dto.getReason())
                .build();
    }
}
