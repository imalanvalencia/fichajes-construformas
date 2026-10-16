package es.construformas.api.dto;

import es.construformas.api.model.ClockEntry;
import es.construformas.api.model.ClockType;
import es.construformas.api.model.Project;
import es.construformas.api.model.User;

/**
 * Maps between the flat {@link ClockEntryDTO} wire contract and the JPA
 * {@link ClockEntry} entity. The entity keeps its associations; only the wire
 * representation is flat.
 */
public final class ClockEntryMapper {

    private ClockEntryMapper() {
    }

    public static ClockEntryDTO toDto(ClockEntry entry) {
        if (entry == null) return null;
        return ClockEntryDTO.builder()
                .id(entry.getId())
                .userId(entry.getUser() != null ? entry.getUser().getId() : null)
                .userName(entry.getUser() != null ? entry.getUser().getName() : null)
                .projectId(entry.getProject() != null ? entry.getProject().getId() : null)
                .projectName(entry.getProject() != null ? entry.getProject().getName() : null)
                .clockType(entry.getClockType() != null ? entry.getClockType().name() : null)
                .userLatitude(entry.getUserLatitude())
                .userLongitude(entry.getUserLongitude())
                .timestamp(entry.getTimestamp())
                .notes(entry.getNotes())
                .build();
    }

    public static ClockEntry toEntity(ClockEntryDTO dto) {
        if (dto == null) return null;
        return ClockEntry.builder()
                .user(dto.getUserId() != null ? User.builder().id(dto.getUserId()).build() : null)
                .project(dto.getProjectId() != null ? Project.builder().id(dto.getProjectId()).build() : null)
                .clockType(dto.getClockType() != null ? ClockType.valueOf(dto.getClockType()) : null)
                .userLatitude(dto.getUserLatitude())
                .userLongitude(dto.getUserLongitude())
                .timestamp(dto.getTimestamp())
                .notes(dto.getNotes())
                .build();
    }
}
