package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierInvoiceItemDTO {
    private Long id;
    @NotBlank
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
