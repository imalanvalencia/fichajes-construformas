package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetItemRepository budgetItemRepository;
    private final BudgetDiscountRepository budgetDiscountRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;

    public Budget create(Budget budget) {
        Project project = projectRepository.findById(budget.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User creator = userRepository.findById(budget.getCreatedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        budget.setProject(project);
        budget.setCreatedBy(creator);
        if (budget.getStatus() == null) budget.setStatus(BudgetStatus.DRAFT);
        if (budget.getVersion() == null) budget.setVersion(1);
        if (budget.getBudgetType() == null) budget.setBudgetType(BudgetType.ORIGINAL);
        if (budget.getTotalAmount() == null) budget.setTotalAmount(BigDecimal.ZERO);
        if (budget.getDiscountAmount() == null) budget.setDiscountAmount(BigDecimal.ZERO);
        if (budget.getFinalAmount() == null)
            budget.setFinalAmount(budget.getTotalAmount().subtract(budget.getDiscountAmount()));

        return budgetRepository.save(budget);
    }

    public Budget findById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));
    }

    public List<Budget> findByProject(Long projectId) {
        return budgetRepository.findByProjectId(projectId);
    }

    public List<Budget> findVersions(Long originalBudgetId) {
        return budgetRepository.findByOriginalBudgetId(originalBudgetId);
    }

    public Budget createNewVersion(Long budgetId, Long userId) {
        Budget original = findById(budgetId);

        boolean hasIssuedInvoices = invoiceRepository.existsByProjectIdAndStatus(
                original.getProject().getId(), InvoiceStatus.ISSUED);
        if (hasIssuedInvoices) {
            throw new IllegalStateException("Cannot modify budget: project has issued invoices");
        }

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Budget newVersion = Budget.builder()
                .project(original.getProject())
                .originalBudget(original.getOriginalBudget() != null ? original.getOriginalBudget() : original)
                .version(original.getVersion() + 1)
                .budgetType(BudgetType.VERSION)
                .status(BudgetStatus.DRAFT)
                .totalAmount(original.getTotalAmount())
                .discountAmount(original.getDiscountAmount())
                .finalAmount(original.getFinalAmount())
                .validUntil(original.getValidUntil())
                .notes(original.getNotes())
                .paymentTerms(original.getPaymentTerms())
                .termsConditions(original.getTermsConditions())
                .createdBy(creator)
                .build();

        Budget saved = budgetRepository.save(newVersion);

        original.setStatus(BudgetStatus.SUPERSEDED);
        budgetRepository.save(original);

        return saved;
    }

    public Budget approve(Long budgetId, Long userId) {
        Budget budget = findById(budgetId);
        User approver = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        budget.setStatus(BudgetStatus.APPROVED);
        budget.setApprovedBy(approver);
        budget.setApprovedAt(LocalDateTime.now());

        return budgetRepository.save(budget);
    }

    public Budget updateStatus(Long budgetId, BudgetStatus newStatus) {
        Budget budget = findById(budgetId);
        budget.setStatus(newStatus);
        return budgetRepository.save(budget);
    }

    public void delete(Long id) {
        Budget budget = findById(id);
        if (budget.getStatus() == BudgetStatus.APPROVED) {
            throw new IllegalStateException("Cannot delete an approved budget");
        }
        budgetRepository.deleteById(id);
    }

    public BudgetItem addItem(Long budgetId, BudgetItem item) {
        Budget budget = findById(budgetId);
        item.setBudget(budget);
        if (item.getOrderNum() == null) item.setOrderNum(0);
        return budgetItemRepository.save(item);
    }

    public List<BudgetItem> getItems(Long budgetId) {
        return budgetItemRepository.findByBudgetIdOrderByOrderNum(budgetId);
    }

    public BudgetDiscount addDiscount(Long budgetId, BudgetDiscount discount) {
        Budget budget = findById(budgetId);
        discount.setBudget(budget);
        return budgetDiscountRepository.save(discount);
    }

    public List<BudgetDiscount> getDiscounts(Long budgetId) {
        return budgetDiscountRepository.findByBudgetId(budgetId);
    }

    public void recalculateTotals(Long budgetId) {
        Budget budget = findById(budgetId);
        List<BudgetItem> items = getItems(budgetId);
        List<BudgetDiscount> discounts = getDiscounts(budgetId);

        BigDecimal total = items.stream()
                .map(BudgetItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = discounts.stream()
                .map(BudgetDiscount::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        budget.setTotalAmount(total);
        budget.setDiscountAmount(discount);
        budget.setFinalAmount(total.subtract(discount));

        budgetRepository.save(budget);
    }
}
