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
public class PaymentDTO {
    private Long id;
    private Long invoiceId;
    @NotNull
    private Long projectId;
    private String projectName;
    @NotNull
    private Long clientId;
    private String clientName;
    @NotNull
    private Long paymentMethodId;
    private String paymentMethodName;
    @NotNull
    private BigDecimal amount;
    @NotNull
    private LocalDate paymentDate;
    private String reference;
    @NotBlank
    private String type;
    private String notes;
    private Long createdBy;
}
