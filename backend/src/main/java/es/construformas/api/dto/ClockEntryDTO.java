package es.construformas.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClockEntryDTO {
    private Long id;
    @NotNull
    private Long userId;
    private String userName;
    @NotNull
    private Long projectId;
    private String projectName;
    private String clockType;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private String notes;
}
