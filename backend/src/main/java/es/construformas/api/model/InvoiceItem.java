package es.construformas.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

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

    @Builder.Default
    @Column(nullable = false)
    private Integer orderNum = 0;
}
