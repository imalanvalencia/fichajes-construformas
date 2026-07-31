package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierInvoiceDTO {
    private Long id;
    @NotNull
    private Long supplierId;
    private String supplierName;
    private Long projectId;
    private String projectName;
    @NotBlank
    private String invoiceNumber;
    @NotNull
    private LocalDate invoiceDate;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private String status;
    private String notes;
    private String filePath;
    private Long createdBy;
    private List<SupplierInvoiceItemDTO> items;
}
