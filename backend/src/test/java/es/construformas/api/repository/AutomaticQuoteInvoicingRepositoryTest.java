package es.construformas.api.repository;

import es.construformas.api.model.Budget;
import es.construformas.api.model.BudgetStatus;
import es.construformas.api.model.BudgetType;
import es.construformas.api.model.Client;
import es.construformas.api.model.DocumentLifecycleEvent;
import es.construformas.api.model.DocumentLifecycleEventType;
import es.construformas.api.model.Invoice;
import es.construformas.api.model.InvoiceYearSequence;
import es.construformas.api.model.InvoiceStatus;
import es.construformas.api.model.Project;
import es.construformas.api.model.ProjectStatus;
import es.construformas.api.model.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@ActiveProfiles("test")
class AutomaticQuoteInvoicingRepositoryTest {

    @Autowired private EntityManager entityManager;
    @Autowired private BudgetRepository budgetRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private DocumentLifecycleEventRepository documentLifecycleEventRepository;
    @Autowired private InvoiceYearSequenceRepository invoiceYearSequenceRepository;

    @Test
    void normalDocumentQueriesExcludeSoftDeletedRecordsWhileLifecycleReadsRemainAvailable() {
        User user = persist(User.builder().name("Test User").email("test@example.com").password("hash").build());
        Client client = persist(Client.builder().name("Test Client").build());
        Project project = persist(Project.builder()
            .client(client).name("Test Project").address("Test address")
            .latitude(0.0).longitude(0.0).status(ProjectStatus.PLANNED).build());
        Budget budget = persist(Budget.builder()
            .project(project).client(client).createdBy(user).budgetType(BudgetType.ORIGINAL)
            .status(BudgetStatus.APPROVED).build());
        Invoice invoice = persist(Invoice.builder()
            .project(project).client(client).createdBy(user).sourceBudgetId(budget.getId())
            .invoiceNumber("INV-2026-001").status(InvoiceStatus.DRAFT)
            .subtotal(BigDecimal.ZERO).taxAmount(BigDecimal.ZERO).total(BigDecimal.ZERO).build());
        DocumentLifecycleEvent event = persist(DocumentLifecycleEvent.builder()
            .type(DocumentLifecycleEventType.INVOICE_CREATED).budget(budget).invoice(invoice)
            .actor(user).occurredAt(LocalDateTime.now()).build());

        budget.setDeletedAt(LocalDateTime.now());
        budget.setDeletedBy(user);
        invoice.setDeletedAt(LocalDateTime.now());
        invoice.setDeletedBy(user);
        entityManager.flush();
        entityManager.clear();

        assertTrue(budgetRepository.findById(budget.getId()).isEmpty());
        assertTrue(invoiceRepository.findById(invoice.getId()).isEmpty());
        assertEquals(0, budgetRepository.findAll().size());
        assertEquals(0, invoiceRepository.findAll().size());
        assertEquals(event.getId(), documentLifecycleEventRepository
            .findByBudgetIdOrderByOccurredAtAsc(budget.getId()).get(0).getId());
    }

    @Test
    void yearlySequencePersistsItsLastAllocatedValue() {
        InvoiceYearSequence sequence = invoiceYearSequenceRepository.saveAndFlush(
            InvoiceYearSequence.builder().year(2026).lastValue(2).build());

        assertEquals(2, invoiceYearSequenceRepository.findById(sequence.getYear())
            .orElseThrow().getLastValue());
    }

    private <T> T persist(T entity) {
        entityManager.persist(entity);
        entityManager.flush();
        return entity;
    }
}
