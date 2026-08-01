package es.construformas.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rectifying_invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RectifyingInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "original_invoice_id", nullable = false)
    private Invoice originalInvoice;

    @Column(nullable = false, unique = true)
    private String rectifyingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RectifyingInvoiceStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    private LocalDate issuedDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        if (status == RectifyingInvoiceStatus.ISSUED) {
            throw new IllegalStateException("Cannot modify a rectifying invoice that has been issued.");
        }
        updatedAt = LocalDateTime.now();
    }
}
