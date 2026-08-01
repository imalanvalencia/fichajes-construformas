package es.construformas.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkProgressDTO {
    private Long id;
    @NotNull
    private Long projectId;
    private Long phaseId;
    @NotNull
    private Long reportedBy;
    private String reporterName;
    @NotNull
    private LocalDate progressDate;
    @Min(0)
    @Max(100)
    private Integer percentage;
    private String notes;
}
