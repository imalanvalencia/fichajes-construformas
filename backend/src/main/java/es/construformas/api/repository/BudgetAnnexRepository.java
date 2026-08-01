package es.construformas.api.repository;

import es.construformas.api.model.BudgetAnnex;
import es.construformas.api.model.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetAnnexRepository extends JpaRepository<BudgetAnnex, Long> {
    List<BudgetAnnex> findByBudgetId(Long budgetId);
    List<BudgetAnnex> findByBudgetIdAndStatus(Long budgetId, BudgetStatus status);
}
