package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAnnexDTO {
    private Long id;
    @NotNull
    private Long budgetId;
    @NotBlank
    private String description;
    private BigDecimal amount;
    private String status;
    private Long createdBy;
}
