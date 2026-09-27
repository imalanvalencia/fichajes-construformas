package es.construformas.api.service;

import es.construformas.api.exception.BudgetNotFoundException;

/**
 * Renders a Budget entity into a downloadable PDF document.
 */
public interface BudgetPdfService {

    /**
     * Generates the PDF for the given budget.
     *
     * @param budgetId budget primary key
     * @return PDF file content
     * @throws BudgetNotFoundException if no budget exists with the given id
     */
    byte[] generatePdf(Long budgetId) throws BudgetNotFoundException;
}
