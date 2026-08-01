package es.construformas.api.repository;

import es.construformas.api.model.Payment;
import es.construformas.api.model.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByProjectId(Long projectId);
    List<Payment> findByClientId(Long clientId);
    List<Payment> findByProjectIdIn(List<Long> projectIds);
    List<Payment> findByInvoiceId(Long invoiceId);
    List<Payment> findByType(PaymentType type);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.project.id = :projectId")
    BigDecimal sumPaymentsByProject(@Param("projectId") Long projectId);
}
