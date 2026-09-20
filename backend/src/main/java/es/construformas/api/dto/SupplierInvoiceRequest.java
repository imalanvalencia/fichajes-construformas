package es.construformas.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SupplierInvoiceRequest {
    private Long supplierId;
    private Long projectId;
    private Long createdById;
    private String invoiceNumber;
    private String invoiceDate;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private String status;
    private String notes;
}
