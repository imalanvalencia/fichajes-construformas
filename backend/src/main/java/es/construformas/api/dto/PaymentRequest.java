package es.construformas.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long invoiceId;
    private Long projectId;
    private Long clientId;
    private Long paymentMethodId;
    private Long createdById;
    private BigDecimal amount;
    private String paymentDate;
    private String reference;
    private String type;
    private String notes;
}
