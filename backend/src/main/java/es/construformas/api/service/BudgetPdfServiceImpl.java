package es.construformas.api.service;

import com.openhtmltopdf.extend.FSSupplier;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import es.construformas.api.config.CompanyProperties;
import es.construformas.api.exception.BudgetNotFoundException;
import es.construformas.api.model.Budget;
import es.construformas.api.model.BudgetDiscount;
import es.construformas.api.model.BudgetItem;
import es.construformas.api.repository.BudgetDiscountRepository;
import es.construformas.api.repository.BudgetItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetPdfServiceImpl implements BudgetPdfService {

    private static final BigDecimal IVA_RATE = new BigDecimal("0.21");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String PNG_DATA_URI_PREFIX = "data:image/png;base64,";
    private static final String FONT_FAMILY = "Poppins";
    private static final ResourceLoader RESOURCE_LOADER = new DefaultResourceLoader();

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
        context.setVariable("companyPhone", companyProperties.getPhone());
        context.setVariable("companyEmail", companyProperties.getEmail());
        context.setVariable("companyWebsite", companyProperties.getWebsite());
        context.setVariable("companyLogoPath", companyProperties.getLogoPath());
        context.setVariable("companyLogoDataUri", resolveLogoDataUri());
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

    /**
     * Reads the configured company logo and inlines it as a base64 PNG data URI.
     *
     * <p>OpenHTMLtoPDF resolves {@code data:} URIs natively but has no idea about Spring's
     * {@code classpath:} scheme, so the resource must be embedded in the HTML instead of
     * referenced by path. Returns {@code null} when the logo is unconfigured, missing or
     * unreadable so a broken asset can never break PDF generation.
     */
    String resolveLogoDataUri() {
        String logoPath = companyProperties.getLogoPath();
        if (logoPath == null || logoPath.isBlank()) {
            return null;
        }
        try {
            Resource resource = RESOURCE_LOADER.getResource(logoPath);
            if (!resource.exists()) {
                return null;
            }
            try (InputStream in = resource.getInputStream()) {
                byte[] bytes = StreamUtils.copyToByteArray(in);
                return PNG_DATA_URI_PREFIX + Base64.getEncoder().encodeToString(bytes);
            }
        } catch (Exception e) {
            // Missing, unreadable or malformed resource: fall back to the initials placeholder.
            return null;
        }
    }

    private byte[] renderPdf(String html) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            registerFonts(builder);
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate budget PDF", e);
        }
    }

    /**
     * Registers the Poppins family used by the budget template: Regular (400), SemiBold (600)
     * and Bold (700).
     */
    private void registerFonts(PdfRendererBuilder builder) {
        registerFont(builder, "fonts/poppins/Poppins-Regular.ttf", 400);
        registerFont(builder, "fonts/poppins/Poppins-SemiBold.ttf", 600);
        registerFont(builder, "fonts/poppins/Poppins-Bold.ttf", 700);
    }

    /**
     * Registers a single font face from the classpath through an {@link FSSupplier} of streams.
     *
     * <p>A {@code java.io.File} path cannot be used here: inside a packaged fat JAR the font is
     * not a real file, so {@code useFont(File, ...)} would break in production while still working
     * from the IDE. The supplier hands the renderer a fresh in-memory stream on every call.
     *
     * <p>Font setup must never break PDF generation: a missing, empty or unreadable resource is
     * skipped and the renderer falls back to the Helvetica/Arial stack declared in the template.
     */
    private void registerFont(PdfRendererBuilder builder, String location, int weight) {
        try {
            Resource resource = RESOURCE_LOADER.getResource("classpath:" + location);
            if (!resource.exists()) {
                return;
            }
            byte[] data;
            try (InputStream in = resource.getInputStream()) {
                data = StreamUtils.copyToByteArray(in);
            }
            if (data.length == 0) {
                return;
            }
            FSSupplier<InputStream> supplier = () -> new ByteArrayInputStream(data);
            builder.useFont(supplier, FONT_FAMILY, weight, FontStyle.NORMAL, true);
        } catch (Exception e) {
            // Degrade to the template's Helvetica fallback instead of failing the render.
            log.warn("Skipping PDF font {} (weight {}): {}", location, weight, e.toString());
        }
    }
}
