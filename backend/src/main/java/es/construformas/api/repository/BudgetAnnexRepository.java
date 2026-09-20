package es.construformas.api.repository;

import es.construformas.api.model.BudgetAnnex;
import es.construformas.api.model.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetAnnexRepository extends JpaRepository<BudgetAnnex, Long> {
    List<BudgetAnnex> findByBudgetId(Long budgetId);
    List<BudgetAnnex> findByBudgetIdAndStatus(Long budgetId, BudgetStatus status);
}
