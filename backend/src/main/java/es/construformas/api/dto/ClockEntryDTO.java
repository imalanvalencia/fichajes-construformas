package es.construformas.api.dto;

import es.construformas.api.model.ClockType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClockEntryDTO {

    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Clock type is required")
    private ClockType clockType;

    private LocalDateTime timestamp;

    private Double latitude;

    private Double longitude;

    private String notes;
}
