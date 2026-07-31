package es.construformas.api.repository;

import es.construformas.api.model.Invoice;
import es.construformas.api.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByProjectId(Long projectId);
    List<Invoice> findByClientId(Long clientId);
    List<Invoice> findByStatus(InvoiceStatus status);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    boolean existsByProjectIdAndStatus(Long projectId, InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.project.id = :projectId AND i.status IN ('ISSUED', 'PAID')")
    BigDecimal sumInvoicedByProject(@Param("projectId") Long projectId);
}
