package es.construformas.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "supplier_invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierInvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_invoice_id", nullable = false)
    private SupplierInvoice supplierInvoice;

    @Column(nullable = false)
    private String description;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;
}
