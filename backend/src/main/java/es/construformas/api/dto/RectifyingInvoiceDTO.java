package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RectifyingInvoiceDTO {
    private Long id;
    @NotNull
    private Long originalInvoiceId;
    private String rectifyingNumber;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    @NotBlank
    private String reason;
    private LocalDate issuedDate;
    private Long createdBy;
}
