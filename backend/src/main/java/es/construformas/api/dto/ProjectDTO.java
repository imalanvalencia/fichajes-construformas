package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
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
public class ProjectDTO {
    private Long id;
    @NotNull
    private Long clientId;
    private String clientName;
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String address;
    private String city;
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
    private Integer allowedRadiusMeters;
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private LocalDate actualEndDate;
    private String status;
    private boolean active;
}
