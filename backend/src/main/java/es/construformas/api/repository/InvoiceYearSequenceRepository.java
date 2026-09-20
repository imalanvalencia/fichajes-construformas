package es.construformas.api.repository;

import es.construformas.api.model.InvoiceYearSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceYearSequenceRepository extends JpaRepository<InvoiceYearSequence, Integer> {
    @Query(value = "INSERT INTO invoice_year_sequences (year, last_value) VALUES (:year, 1) "
        + "ON CONFLICT (year) DO UPDATE SET last_value = invoice_year_sequences.last_value + 1 "
        + "RETURNING last_value", nativeQuery = true)
    int allocateNextValue(@Param("year") int year);
}
