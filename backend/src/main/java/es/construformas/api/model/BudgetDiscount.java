package es.construformas.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDiscount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @Column(nullable = false)
    private String description;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    private BigDecimal percentage;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
