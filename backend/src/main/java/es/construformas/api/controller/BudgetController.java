package es.construformas.api.controller;

import es.construformas.api.dto.BudgetRequest;
import es.construformas.api.model.Budget;
import es.construformas.api.model.BudgetStatus;
import es.construformas.api.model.BudgetDiscount;
import es.construformas.api.model.BudgetItem;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.security.SecurityUtils;
import es.construformas.api.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<Budget>> getAll() {
        return ResponseEntity.ok(budgetService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Budget> create(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<Budget> getById(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.findById(id));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<Budget>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(budgetService.findByProject(projectId));
    }

    @PostMapping("/{id}/new-version")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Budget> createNewVersion(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(budgetService.createNewVersion(id, userId));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BudgetItem> addItem(@PathVariable Long id, @RequestBody BudgetItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.addItem(id, item));
    }

    @GetMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<BudgetItem>> getItems(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getItems(id));
    }

    @DeleteMapping("/{budgetId}/items/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long budgetId, @PathVariable Long itemId) {
        budgetService.deleteItem(budgetId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/discounts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BudgetDiscount> addDiscount(@PathVariable Long id, @RequestBody BudgetDiscount discount) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.addDiscount(id, discount));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<Budget> updateStatus(@PathVariable Long id, @RequestParam String status) {
        BudgetStatus statusToEnum = BudgetStatus.valueOf(status);

        if (statusToEnum == BudgetStatus.APPROVED) {
            Long userId = SecurityUtils.getCurrentUser(userRepository).getId();
            return ResponseEntity.ok(budgetService.approve(id, userId));
        }
        return ResponseEntity.ok(budgetService.updateStatus(id, statusToEnum));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
