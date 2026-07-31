package es.construformas.api.repository;

import es.construformas.api.model.BudgetDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetDiscountRepository extends JpaRepository<BudgetDiscount, Long> {
    List<BudgetDiscount> findByBudgetId(Long budgetId);
}
