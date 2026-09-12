package es.construformas.api.service;

import es.construformas.api.dto.BudgetRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import es.construformas.api.security.SecurityUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private BudgetItemRepository budgetItemRepository;
    @Mock private BudgetDiscountRepository budgetDiscountRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InvoiceItemRepository invoiceItemRepository;
    @Mock private InvoiceYearSequenceRepository invoiceYearSequenceRepository;
    @Mock private DocumentLifecycleEventRepository documentLifecycleEventRepository;
    @InjectMocks private BudgetService budgetService;

    @Test
    @DisplayName("Create budget should default to DRAFT, version 1")
    void shouldCreateBudget() {
        Project project = Project.builder().id(1L).build();
        User user = User.builder().id(1L).build();
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        BudgetRequest request = new BudgetRequest();
        request.setProjectId(1L);
        request.setCreatedById(1L);
        request.setTotalAmount(new BigDecimal("10000"));
        Budget result = budgetService.create(request);

        assertThat(result.getStatus()).isEqualTo(BudgetStatus.DRAFT);
        assertThat(result.getVersion()).isEqualTo(1);
        assertThat(result.getBudgetType()).isEqualTo(BudgetType.ORIGINAL);
    }

    @Test
    @DisplayName("Create budget with missing project should throw")
    void shouldRejectCreateWithMissingProject() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        BudgetRequest request = new BudgetRequest();
        request.setProjectId(99L);
        request.setCreatedById(1L);

        assertThatThrownBy(() -> budgetService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Project not found");
    }

    @Test
    @DisplayName("Create new version should increment version and set DRAFT")
    void shouldCreateNewVersionWhenApproved() {
        Project project = Project.builder().id(1L).build();
        Budget original = Budget.builder().id(1L).version(1).status(BudgetStatus.APPROVED)
                .project(project)
                .totalAmount(new BigDecimal("10000")).build();

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(original));
        when(invoiceRepository.existsByProjectIdAndStatus(1L, InvoiceStatus.ISSUED)).thenReturn(false);
        User user = User.builder().id(1L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        Budget newVersion = budgetService.createNewVersion(1L, 1L);

        assertThat(newVersion.getVersion()).isEqualTo(2);
        assertThat(newVersion.getStatus()).isEqualTo(BudgetStatus.DRAFT);
        assertThat(newVersion.getBudgetType()).isEqualTo(BudgetType.VERSION);
    }

    @Test
    @DisplayName("Create new version should archive old as SUPERSEDED")
    void shouldArchiveOldVersionWhenNewVersionAccepted() {
        Project project = Project.builder().id(1L).build();
        Budget original = Budget.builder().id(1L).version(1).status(BudgetStatus.APPROVED)
                .project(project)
                .totalAmount(new BigDecimal("10000")).build();

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(original));
        when(invoiceRepository.existsByProjectIdAndStatus(1L, InvoiceStatus.ISSUED)).thenReturn(false);
        User user = User.builder().id(1L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        budgetService.createNewVersion(1L, 1L);

        verify(budgetRepository).save(argThat(b -> b.getStatus() == BudgetStatus.SUPERSEDED));
    }

    @Test
    @DisplayName("Create new version with issued invoices should throw")
    void shouldLockBudgetWhenLinkedToIssuedInvoice() {
        Project project = Project.builder().id(1L).build();
        Budget original = Budget.builder().id(1L).version(1).status(BudgetStatus.APPROVED)
                .project(project).build();

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(original));
        when(invoiceRepository.existsByProjectIdAndStatus(1L, InvoiceStatus.ISSUED)).thenReturn(true);

        assertThatThrownBy(() -> budgetService.createNewVersion(1L, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot modify budget");
    }

    @Test
    @DisplayName("Delete approved budget should throw")
    void shouldNotDeleteApprovedBudget() {
        Budget approved = Budget.builder().id(1L).status(BudgetStatus.APPROVED).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(approved));

        assertThatThrownBy(() -> budgetService.delete(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete");
    }

    @Test
    @DisplayName("Delete draft budget should succeed")
    void shouldDeleteDraftBudget() {
        Budget draft = Budget.builder().id(1L).status(BudgetStatus.DRAFT).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(draft));

        budgetService.delete(1L);

        verify(budgetRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Recalculate totals should sum items and subtract discounts")
    void shouldCalculateBudgetTotals() {
        Budget budget = Budget.builder().id(1L).status(BudgetStatus.DRAFT).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));
        when(budgetItemRepository.findByBudgetIdOrderByOrderNum(1L)).thenReturn(List.of(
                BudgetItem.builder().totalPrice(new BigDecimal("5000")).build(),
                BudgetItem.builder().totalPrice(new BigDecimal("3000")).build()
        ));
        when(budgetDiscountRepository.findByBudgetId(1L)).thenReturn(List.of(
                BudgetDiscount.builder().amount(new BigDecimal("500")).build()
        ));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        budgetService.recalculateTotals(1L);

        assertThat(budget.getTotalAmount()).isEqualByComparingTo("8000");
        assertThat(budget.getDiscountAmount()).isEqualByComparingTo("500");
        assertThat(budget.getFinalAmount()).isEqualByComparingTo("7500");
    }

    @Test
    @DisplayName("Find by project should delegate to repository")
    void shouldFindByProject() {
        when(budgetRepository.findByProjectId(1L)).thenReturn(List.of(
                Budget.builder().id(1L).build()
        ));

        var result = budgetService.findByProject(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Find versions should delegate to repository")
    void shouldFindVersions() {
        when(budgetRepository.findByOriginalBudgetId(1L)).thenReturn(List.of(
                Budget.builder().id(2L).version(2).build()
        ));

        var result = budgetService.findVersions(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Approve should create a numbered draft invoice and lifecycle events for an admin")
    void shouldCreateAutomaticInvoiceWhenAdminApprovesEligibleBudget() {
        Client client = Client.builder().id(8L).build();
        Project project = Project.builder().id(2L).client(client).build();
        User admin = User.builder().id(7L).build();
        Budget budget = Budget.builder().id(1L).project(project).createdBy(admin)
                .status(BudgetStatus.SENT).paymentTerms("30 days").build();
        Invoice[] savedInvoice = new Invoice[1];

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));
        when(budgetItemRepository.findByBudgetIdOrderByOrderNum(1L)).thenReturn(List.of(
                BudgetItem.builder().description("Labor").quantity(new BigDecimal("2"))
                        .unitPrice(new BigDecimal("100")).totalPrice(new BigDecimal("200")).orderNum(1).build()));
        when(budgetDiscountRepository.findByBudgetId(1L)).thenReturn(List.of(
                BudgetDiscount.builder().description("Prompt payment").amount(new BigDecimal("20")).build()));
        when(invoiceYearSequenceRepository.allocateNextValue(LocalDate.now().getYear())).thenReturn(7);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            savedInvoice[0] = invocation.getArgument(0);
            savedInvoice[0].setId(9L);
            return savedInvoice[0];
        });
        when(budgetRepository.save(any(Budget.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Budget result;
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(() -> SecurityUtils.hasRole("ADMIN")).thenReturn(true);
            security.when(() -> SecurityUtils.getCurrentUser(userRepository)).thenReturn(admin);
            result = budgetService.approve(1L, 7L);
        }

        assertThat(result.getStatus()).isEqualTo(BudgetStatus.APPROVED);
        assertThat(savedInvoice[0]).isNotNull();
        assertThat(savedInvoice[0].getInvoiceNumber()).isEqualTo("INV-" + LocalDate.now().getYear() + "-007");
        assertThat(savedInvoice[0].getStatus()).isEqualTo(InvoiceStatus.DRAFT);
        assertThat(savedInvoice[0].getClient()).isSameAs(client);
        assertThat(savedInvoice[0].getNotes()).isEqualTo("30 days");
        assertThat(savedInvoice[0].getSubtotal()).isEqualByComparingTo("180");
        assertThat(savedInvoice[0].getTaxAmount()).isEqualByComparingTo("37.80");
        assertThat(savedInvoice[0].getTotal()).isEqualByComparingTo("217.80");
        verify(invoiceItemRepository, times(2)).save(any(InvoiceItem.class));
        verify(documentLifecycleEventRepository, times(2)).save(any(DocumentLifecycleEvent.class));
    }

    @Test
    @DisplayName("Approve should reject a repeated approval without allocating another invoice number")
    void shouldRejectRepeatedApproval() {
        Budget approved = Budget.builder().id(1L).status(BudgetStatus.APPROVED).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(approved));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(() -> SecurityUtils.hasRole("ADMIN")).thenReturn(true);
            assertThatThrownBy(() -> budgetService.approve(1L, 7L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("already approved");
        }

        verifyNoInteractions(invoiceYearSequenceRepository, invoiceRepository, documentLifecycleEventRepository);
    }

    @Test
    @DisplayName("Approve should reject a non-admin actor before any workflow write")
    void shouldRejectNonAdminApproval() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(() -> SecurityUtils.hasRole("ADMIN")).thenReturn(false);

            assertThatThrownBy(() -> budgetService.approve(1L, 7L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("ADMIN");
        }

        verifyNoInteractions(budgetRepository, invoiceYearSequenceRepository, invoiceRepository,
                documentLifecycleEventRepository);
    }

    @Test
    @DisplayName("Approve should propagate invoice persistence failure before approving the budget or creating events")
    void shouldLeaveBudgetUnapprovedWhenAutomaticInvoiceSaveFails() {
        Client client = Client.builder().id(8L).build();
        User admin = User.builder().id(7L).build();
        Budget budget = Budget.builder().id(1L).project(Project.builder().id(2L).client(client).build())
                .createdBy(admin).status(BudgetStatus.SENT).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));
        when(invoiceYearSequenceRepository.allocateNextValue(LocalDate.now().getYear())).thenReturn(1);
        when(invoiceRepository.save(any(Invoice.class))).thenThrow(new IllegalStateException("database unavailable"));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(() -> SecurityUtils.hasRole("ADMIN")).thenReturn(true);
            security.when(() -> SecurityUtils.getCurrentUser(userRepository)).thenReturn(admin);
            assertThatThrownBy(() -> budgetService.approve(1L, 7L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("database unavailable");
        }

        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.SENT);
        verify(budgetRepository, never()).save(any(Budget.class));
        verifyNoInteractions(documentLifecycleEventRepository);
    }

    @Test
    @DisplayName("Remove should require confirmation and preserve an issued automatic invoice")
    void shouldRejectUnconfirmedOrIssuedAutomaticInvoiceRemoval() {
        User admin = User.builder().id(7L).build();
        Budget approved = Budget.builder().id(1L).status(BudgetStatus.APPROVED).build();
        Invoice issued = Invoice.builder().id(9L).status(InvoiceStatus.ISSUED).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(approved));
        when(invoiceRepository.findBySourceBudgetId(1L)).thenReturn(Optional.of(issued));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(() -> SecurityUtils.hasRole("ADMIN")).thenReturn(true);
            assertThatThrownBy(() -> budgetService.delete(1L, false, admin))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("confirmation");
            assertThatThrownBy(() -> budgetService.delete(1L, true, admin))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("issued or paid");
        }

        assertThat(approved.getDeletedAt()).isNull();
        assertThat(issued.getDeletedAt()).isNull();
        verifyNoInteractions(documentLifecycleEventRepository);
    }

    @Test
    @DisplayName("Remove should soft-delete only a linked draft invoice and preserve lifecycle history")
    void shouldSoftDeleteApprovedBudgetAndLinkedDraftInvoice() {
        User admin = User.builder().id(7L).build();
        Budget approved = Budget.builder().id(1L).status(BudgetStatus.APPROVED).build();
        Invoice draft = Invoice.builder().id(9L).status(InvoiceStatus.DRAFT).build();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(approved));
        when(invoiceRepository.findBySourceBudgetId(1L)).thenReturn(Optional.of(draft));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(() -> SecurityUtils.hasRole("ADMIN")).thenReturn(true);
            budgetService.delete(1L, true, admin);
        }

        assertThat(approved.getDeletedAt()).isNotNull();
        assertThat(approved.getDeletedBy()).isSameAs(admin);
        assertThat(draft.getDeletedAt()).isNotNull();
        assertThat(draft.getDeletedBy()).isSameAs(admin);
        verify(documentLifecycleEventRepository).save(argThat(event ->
                event.getType() == DocumentLifecycleEventType.BUDGET_REMOVED
                        && event.getBudget() == approved
                        && event.getInvoice() == draft
                        && event.getActor() == admin));
    }
}
