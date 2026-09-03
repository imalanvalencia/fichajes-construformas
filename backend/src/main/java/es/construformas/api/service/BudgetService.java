package es.construformas.api.service;

import es.construformas.api.dto.BudgetRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import es.construformas.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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

    public Budget create(BudgetRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BudgetType budgetType = request.getBudgetType() != null
                ? BudgetType.valueOf(request.getBudgetType())
                : BudgetType.ORIGINAL;

        BudgetStatus status = request.getStatus() != null
                ? BudgetStatus.valueOf(request.getStatus())
                : BudgetStatus.DRAFT;

        Budget budget = Budget.builder()
                .project(project)
                .createdBy(creator)
                .budgetType(budgetType)
                .status(status)
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .finalAmount(request.getFinalAmount() != null ? request.getFinalAmount() : BigDecimal.ZERO)
                .validUntil(parseDate(request.getValidUntil()))
                .notes(request.getNotes())
                .paymentTerms(request.getPaymentTerms())
                .termsConditions(request.getTermsConditions())
                .build();

        if (budget.getFinalAmount().compareTo(BigDecimal.ZERO) == 0 && budget.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
            budget.setFinalAmount(budget.getTotalAmount().subtract(budget.getDiscountAmount()));
        }

        if (request.getApprovedById() != null) {
            User approver = userRepository.findById(request.getApprovedById())
                    .orElseThrow(() -> new IllegalArgumentException("Approver user not found"));
            budget.setApprovedBy(approver);
            budget.setApprovedAt(LocalDateTime.now());
        }

        return budgetRepository.save(budget);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateStr + ". Expected yyyy-MM-dd");
        }
    }

    public List<Budget> findAll() {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            List<Long> projectIds = operatorProjects.stream().map(Project::getId).toList();
            return budgetRepository.findByProjectIdIn(projectIds);
        }
        return budgetRepository.findAll();
    }

    public Budget findById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!projectRepository.existsByProjectIdAndOperatorId(budget.getProject().getId(), user.getId())) {
                throw new IllegalArgumentException("Access denied: not assigned to this project");
            }
        }
        return budget;
    }

    public List<Budget> findByProject(Long projectId) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!projectRepository.existsByProjectIdAndOperatorId(projectId, user.getId())) {
                throw new IllegalArgumentException("Access denied: not assigned to this project");
            }
        }
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

    public void deleteItem(Long budgetId, Long itemId) {
        Budget budget = findById(budgetId);
        BudgetItem item = budgetItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (!item.getBudget().getId().equals(budget.getId())) {
            throw new IllegalArgumentException("Item does not belong to this budget");
        }
        budgetItemRepository.deleteById(itemId);
        recalculateTotals(budgetId);
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
