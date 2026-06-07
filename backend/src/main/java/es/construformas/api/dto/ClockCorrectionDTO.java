package es.construformas.api.dto;

import es.construformas.api.model.ClockType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ClockCorrectionDTO {

    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long originalEntryId;

    @NotNull(message = "Correction date is required")
    private LocalDate correctionDate;

    @NotNull(message = "Original clock type is required")
    private ClockType originalClockType;

    @NotNull(message = "Corrected time is required")
    private LocalDateTime correctedTime;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String status;
}
