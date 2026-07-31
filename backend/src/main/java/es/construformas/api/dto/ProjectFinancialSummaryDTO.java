package es.construformas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectFinancialSummaryDTO {
    private Long projectId;
    private String projectName;
    private BigDecimal totalBudgeted;
    private BigDecimal totalInvoiced;
    private BigDecimal totalCollected;
    private BigDecimal pendingInvoicing;
    private BigDecimal pendingCollection;
    private BigDecimal invoicingPercentage;
    private BigDecimal collectionPercentage;
}
