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
public class WorkPhotoDTO {
    private Long id;
    @NotNull
    private Long projectId;
    private Long phaseId;
    @NotNull
    private Long uploadedBy;
    private String uploaderName;
    @NotBlank
    private String filePath;
    private String description;
    @NotNull
    private LocalDate photoDate;
}
