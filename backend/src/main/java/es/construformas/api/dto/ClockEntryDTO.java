package es.construformas.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Flat wire contract for clock entries, shared by the request and the response
 * bodies of /api/clock-entries. Nesting the JPA user/project associations would
 * expose whole entities and break the frontend's flat ClockEntry type.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClockEntryDTO {
    private Long id;
    /** Optional: omitted means "clock in the authenticated user" (see S2). */
    private Long userId;
    private String userName;
    @NotNull
    private Long projectId;
    private String projectName;
    @NotNull
    private String clockType;
    @NotNull
    private Double userLatitude;
    @NotNull
    private Double userLongitude;
    private LocalDateTime timestamp;
    private String notes;
}
