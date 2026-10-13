package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Flat wire contract for clock corrections, shared by the request and the response
 * bodies of /api/clock-corrections. The entity's user/project/originalEntry/reviewedBy
 * associations stay out of the payload.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClockCorrectionDTO {
    private Long id;
    /** Optional: omitted means "request on behalf of the authenticated user". */
    private Long userId;
    private String userName;
    @NotNull
    private Long projectId;
    private String projectName;
    private Long originalEntryId;
    @NotNull
    private LocalDate correctionDate;
    @NotNull
    private String originalClockType;
    @NotNull
    private LocalDateTime correctedTime;
    @NotBlank
    private String reason;
    private String status;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
