package es.construformas.api.exception;

/**
 * Thrown when a requested budget does not exist (or is soft-deleted).
 * Mapped to HTTP 404 by {@link GlobalExceptionHandler}.
 */
public class BudgetNotFoundException extends RuntimeException {

    public BudgetNotFoundException(Long budgetId) {
        super("Budget not found: " + budgetId);
    }
}
