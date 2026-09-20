package es.construformas.api.dto;

import es.construformas.api.model.InvoiceStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceRequest {
    private Long projectId;
    private Long clientId;
    private Long createdById;
    private String invoiceNumber;
    private InvoiceStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private LocalDate issuedDate;
    private LocalDate dueDate;
    private String notes;
}
