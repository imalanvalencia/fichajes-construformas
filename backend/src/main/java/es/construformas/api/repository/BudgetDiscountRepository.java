package es.construformas.api.repository;

import es.construformas.api.model.BudgetDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetDiscountRepository extends JpaRepository<BudgetDiscount, Long> {
    List<BudgetDiscount> findByBudgetId(Long budgetId);
}
