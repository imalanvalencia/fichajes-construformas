package es.construformas.api.repository;

import es.construformas.api.model.DocumentLifecycleEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentLifecycleEventRepository extends JpaRepository<DocumentLifecycleEvent, Long> {
    List<DocumentLifecycleEvent> findByBudgetIdOrderByOccurredAtAsc(Long budgetId);
    List<DocumentLifecycleEvent> findByInvoiceIdOrderByOccurredAtAsc(Long invoiceId);
}
