package es.construformas.api.service;

import es.construformas.api.dto.BudgetRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private BudgetItemRepository budgetItemRepository;
    @Mock private BudgetDiscountRepository budgetDiscountRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private InvoiceRepository invoiceRepository;
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
}
