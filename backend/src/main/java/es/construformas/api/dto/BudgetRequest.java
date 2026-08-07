package es.construformas.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {
    private Long projectId;
    private Long createdById;
    private Long approvedById;
    private String budgetType;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String validUntil;
    private String notes;
    private String paymentTerms;
    private String termsConditions;
}
