package es.construformas.api.dto;

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
public class InvoiceDTO {
    private Long id;
    @NotNull
    private Long projectId;
    private String projectName;
    @NotNull
    private Long clientId;
    private String clientName;
    private String invoiceNumber;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private LocalDate issuedDate;
    private LocalDate dueDate;
    private String notes;
    private Long createdBy;
    private List<InvoiceItemDTO> items;
}
