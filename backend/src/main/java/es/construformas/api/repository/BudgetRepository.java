package es.construformas.api.repository;

import es.construformas.api.model.Budget;
import es.construformas.api.model.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    @Query("SELECT b FROM Budget b WHERE b.deletedAt IS NULL")
    List<Budget> findAll();
    @Query("SELECT b FROM Budget b WHERE b.id = :id AND b.deletedAt IS NULL")
    Optional<Budget> findById(@Param("id") Long id);
    List<Budget> findByProjectIdAndDeletedAtIsNull(Long projectId);
    List<Budget> findByProjectIdInAndDeletedAtIsNull(List<Long> projectIds);
    List<Budget> findByProjectIdAndStatusAndDeletedAtIsNull(Long projectId, BudgetStatus status);
    Optional<Budget> findTopByProjectIdAndStatusAndDeletedAtIsNullOrderByVersionDesc(Long projectId, BudgetStatus status);
    List<Budget> findByOriginalBudgetIdAndDeletedAtIsNull(Long originalBudgetId);
    boolean existsByProjectIdAndStatusAndDeletedAtIsNull(Long projectId, BudgetStatus status);
    @Query("SELECT b FROM Budget b WHERE b.project.id = :projectId AND b.deletedAt IS NULL")
    List<Budget> findByProjectId(@Param("projectId") Long projectId);
    @Query("SELECT b FROM Budget b WHERE b.project.id IN :projectIds AND b.deletedAt IS NULL")
    List<Budget> findByProjectIdIn(@Param("projectIds") List<Long> projectIds);
    @Query("SELECT b FROM Budget b WHERE b.project.id = :projectId AND b.status = :status AND b.deletedAt IS NULL")
    List<Budget> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") BudgetStatus status);
    @Query("SELECT b FROM Budget b WHERE b.originalBudget.id = :originalBudgetId AND b.deletedAt IS NULL")
    List<Budget> findByOriginalBudgetId(@Param("originalBudgetId") Long originalBudgetId);
    @Query("SELECT COUNT(b) > 0 FROM Budget b WHERE b.project.id = :projectId AND b.status = :status AND b.deletedAt IS NULL")
    boolean existsByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") BudgetStatus status);
}
