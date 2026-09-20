package es.construformas.api.repository;

import es.construformas.api.model.Invoice;
import es.construformas.api.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    @Query("SELECT i FROM Invoice i WHERE i.deletedAt IS NULL")
    List<Invoice> findAll();
    @Query("SELECT i FROM Invoice i WHERE i.id = :id AND i.deletedAt IS NULL")
    Optional<Invoice> findById(@Param("id") Long id);
    List<Invoice> findByProjectIdAndDeletedAtIsNull(Long projectId);
    List<Invoice> findByClientIdAndDeletedAtIsNull(Long clientId);
    List<Invoice> findByProjectIdInAndDeletedAtIsNull(List<Long> projectIds);
    List<Invoice> findByStatusAndDeletedAtIsNull(InvoiceStatus status);
    Optional<Invoice> findByInvoiceNumberAndDeletedAtIsNull(String invoiceNumber);
    Optional<Invoice> findBySourceBudgetId(Long sourceBudgetId);
    boolean existsByProjectIdAndStatusAndDeletedAtIsNull(Long projectId, InvoiceStatus status);
    @Query("SELECT i FROM Invoice i WHERE i.project.id = :projectId AND i.deletedAt IS NULL")
    List<Invoice> findByProjectId(@Param("projectId") Long projectId);
    @Query("SELECT i FROM Invoice i WHERE i.client.id = :clientId AND i.deletedAt IS NULL")
    List<Invoice> findByClientId(@Param("clientId") Long clientId);
    @Query("SELECT i FROM Invoice i WHERE i.project.id IN :projectIds AND i.deletedAt IS NULL")
    List<Invoice> findByProjectIdIn(@Param("projectIds") List<Long> projectIds);
    @Query("SELECT i FROM Invoice i WHERE i.status = :status AND i.deletedAt IS NULL")
    List<Invoice> findByStatus(@Param("status") InvoiceStatus status);
    @Query("SELECT i FROM Invoice i WHERE i.invoiceNumber = :invoiceNumber AND i.deletedAt IS NULL")
    Optional<Invoice> findByInvoiceNumber(@Param("invoiceNumber") String invoiceNumber);
    @Query("SELECT COUNT(i) > 0 FROM Invoice i WHERE i.project.id = :projectId AND i.status = :status AND i.deletedAt IS NULL")
    boolean existsByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.project.id = :projectId AND i.deletedAt IS NULL AND i.status IN ('ISSUED', 'PAID')")
    BigDecimal sumInvoicedByProject(@Param("projectId") Long projectId);
}
