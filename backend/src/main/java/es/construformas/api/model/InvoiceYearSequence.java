package es.construformas.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invoice_year_sequences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceYearSequence {
    @Id
    @Column(name = "\"year\"")
    private Integer year;

    @Column(name = "last_value", nullable = false)
    private Integer lastValue;
}
