package es.construformas.api.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import es.construformas.api.config.CompanyProperties;
import es.construformas.api.exception.BudgetNotFoundException;
import es.construformas.api.model.Budget;
import es.construformas.api.model.BudgetDiscount;
import es.construformas.api.model.BudgetItem;
import es.construformas.api.repository.BudgetDiscountRepository;
import es.construformas.api.repository.BudgetItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BudgetPdfServiceImpl implements BudgetPdfService {

    private static final BigDecimal IVA_RATE = new BigDecimal("0.21");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final SpringTemplateEngine pdfTemplateEngine;
    private final BudgetService budgetService;
    private final BudgetItemRepository budgetItemRepository;
    private final BudgetDiscountRepository budgetDiscountRepository;
    private final CompanyProperties companyProperties;

    @Override
    public byte[] generatePdf(Long budgetId) throws BudgetNotFoundException {
        Budget budget = findAuthorized(budgetId);

        // Force lazy relation initialization while the persistence context is open
        budget.getClient();
        budget.getProject();

        List<BudgetItem> items = budgetItemRepository.findByBudgetIdOrderByOrderNum(budgetId);
        List<BudgetDiscount> discounts = budgetDiscountRepository.findByBudgetId(budgetId);

        BigDecimal subtotal = budget.getTotalAmount() != null ? budget.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal discount = budget.getDiscountAmount() != null ? budget.getDiscountAmount() : BigDecimal.ZERO;
        boolean includesIva = budget.isIncludesIva();
        BigDecimal finalAmount = budget.getFinalAmount() != null
                ? budget.getFinalAmount()
                : subtotal.subtract(discount);
        BigDecimal ivaAmount = includesIva
                ? finalAmount.subtract(finalAmount.divide(BigDecimal.ONE.add(IVA_RATE), 2, RoundingMode.HALF_UP))
                : BigDecimal.ZERO;
        BigDecimal grandTotal = finalAmount;

        Context context = new Context(Locale.forLanguageTag("es"));
        context.setVariable("budget", budget);
        context.setVariable("client", budget.getClient());
        context.setVariable("project", budget.getProject());
        context.setVariable("items", items);
        context.setVariable("discounts", discounts);
        context.setVariable("companyName", companyProperties.getName());
        context.setVariable("companyAddress", companyProperties.getAddress());
        context.setVariable("companyTaxId", companyProperties.getTaxId());
        context.setVariable("companyLogoPath", companyProperties.getLogoPath());
        context.setVariable("subtotal", subtotal);
        context.setVariable("ivaAmount", ivaAmount);
        context.setVariable("includesIva", includesIva);
        context.setVariable("discountTotal", discount);
        context.setVariable("grandTotal", grandTotal);
        context.setVariable("generationDate", LocalDate.now().format(DATE_FORMAT));
        context.setVariable("validUntilFormatted",
                budget.getValidUntil() != null ? budget.getValidUntil().format(DATE_FORMAT) : null);

        String html = pdfTemplateEngine.process("budget-pdf", context);
        return renderPdf(html);
    }

    /** Same operator scoping as BudgetService.findById; maps missing budget to 404. */
    private Budget findAuthorized(Long budgetId) {
        try {
            return budgetService.findById(budgetId);
        } catch (IllegalArgumentException e) {
            if ("Budget not found".equals(e.getMessage())) {
                throw new BudgetNotFoundException(budgetId);
            }
            throw e;
        }
    }

    private byte[] renderPdf(String html) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate budget PDF", e);
        }
    }
}
