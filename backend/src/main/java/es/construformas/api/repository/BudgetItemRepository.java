package es.construformas.api.repository;

import es.construformas.api.model.BudgetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetItemRepository extends JpaRepository<BudgetItem, Long> {
    List<BudgetItem> findByBudgetIdOrderByOrderNum(Long budgetId);
}
