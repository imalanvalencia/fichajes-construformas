package es.construformas.api.repository;

import es.construformas.api.model.Budget;
import es.construformas.api.model.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByProjectId(Long projectId);
    List<Budget> findByProjectIdAndStatus(Long projectId, BudgetStatus status);
    Optional<Budget> findTopByProjectIdAndStatusOrderByVersionDesc(Long projectId, BudgetStatus status);
    List<Budget> findByOriginalBudgetId(Long originalBudgetId);
    boolean existsByProjectIdAndStatus(Long projectId, BudgetStatus status);
}
