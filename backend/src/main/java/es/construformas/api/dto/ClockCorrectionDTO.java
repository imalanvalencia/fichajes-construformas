package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClockCorrectionDTO {
    private Long id;
    @NotNull
    private Long userId;
    private String userName;
    @NotNull
    private Long projectId;
    private String projectName;
    private Long originalEntryId;
    private LocalDate correctionDate;
    private String originalClockType;
    private LocalDateTime correctedTime;
    @NotBlank
    private String reason;
    private String status;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
}
