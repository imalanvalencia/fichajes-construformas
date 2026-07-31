package es.construformas.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDTO {
    private Long id;
    @NotNull
    private Long projectId;
    private String projectName;
    private Long originalBudgetId;
    private Integer version;
    private String budgetType;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private LocalDate validUntil;
    private String notes;
    private String paymentTerms;
    private String termsConditions;
    private Long createdBy;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private List<BudgetItemDTO> items;
    private List<BudgetDiscountDTO> discounts;
}
