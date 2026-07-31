package es.construformas.api.controller;

import es.construformas.api.model.Budget;
import es.construformas.api.model.BudgetDiscount;
import es.construformas.api.model.BudgetItem;
import es.construformas.api.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<Budget> create(@Valid @RequestBody Budget budget) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(budget));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getById(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.findById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Budget>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(budgetService.findByProject(projectId));
    }

    @PostMapping("/{id}/new-version")
    public ResponseEntity<Budget> createNewVersion(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(budgetService.createNewVersion(id, userId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Budget> approve(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(budgetService.approve(id, userId));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<BudgetItem> addItem(@PathVariable Long id, @RequestBody BudgetItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.addItem(id, item));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<BudgetItem>> getItems(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getItems(id));
    }

    @PostMapping("/{id}/discounts")
    public ResponseEntity<BudgetDiscount> addDiscount(@PathVariable Long id, @RequestBody BudgetDiscount discount) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.addDiscount(id, discount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
