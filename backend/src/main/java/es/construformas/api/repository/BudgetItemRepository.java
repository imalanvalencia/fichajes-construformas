package es.construformas.api.repository;

import es.construformas.api.model.BudgetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetItemRepository extends JpaRepository<BudgetItem, Long> {
    List<BudgetItem> findByBudgetIdOrderByOrderNum(Long budgetId);
}
