package es.construformas.api.service;

import es.construformas.api.config.*;
import es.construformas.api.exception.BudgetNotFoundException;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** Covering tests for verify CRITICAL scenarios: empty items, null zone, no discounts, 30+ items, auth + IVA totals. */
@ExtendWith(MockitoExtension.class)
class BudgetPdfServiceImplTest {
    @Mock private BudgetService budgetService;
    @Mock private BudgetItemRepository budgetItemRepository;
    @Mock private BudgetDiscountRepository budgetDiscountRepository;
    private BudgetPdfServiceImpl service;

    @BeforeEach
    void setUp() {
        CompanyProperties props = new CompanyProperties();
        props.setName("Construformas S.L.");
        service = new BudgetPdfServiceImpl(new ThymeleafPdfConfig().pdfTemplateEngine(),
                budgetService, budgetItemRepository, budgetDiscountRepository, props);
    }

    private PDDocument render(List<BudgetItem> items, List<BudgetDiscount> discounts) throws Exception {
        return render(budgetWithIva(new BigDecimal("1000.00"), BigDecimal.ZERO,
                new BigDecimal("1000.00"), false), items, discounts);
    }

    private PDDocument render(Budget budget, List<BudgetItem> items, List<BudgetDiscount> discounts) throws Exception {
        when(budgetService.findById(42L)).thenReturn(budget);
        when(budgetItemRepository.findByBudgetIdOrderByOrderNum(42L)).thenReturn(items);
        when(budgetDiscountRepository.findByBudgetId(42L)).thenReturn(discounts);
        byte[] pdf = service.generatePdf(42L);
        assertThat(pdf).startsWith("%PDF".getBytes());
        return PDDocument.load(pdf);
    }

    private static String text(PDDocument doc) throws Exception {
        return new PDFTextStripper().getText(doc);
    }

    @Test
    void emptyItemsYieldValidPdfWithEmptyState() throws Exception {
        try (PDDocument doc = render(List.of(), List.of())) {
            assertThat(doc.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            assertThat(text(doc)).contains("no tiene partidas");
        }
    }

    @Test
    void nullZoneItemRendersWithoutZoneGroupingCrash() throws Exception {
        BudgetItem item = BudgetItem.builder().id(1L).description("Floor without zone")
                .quantity(BigDecimal.ONE).unitPrice(BigDecimal.TEN).totalPrice(BigDecimal.TEN).orderNum(1).build();
        try (PDDocument doc = render(List.of(item), List.of())) {
            // null-zone cell falls back to em dash — no zone header row, no crash
            assertThat(text(doc)).contains("Floor without zone", "—");
        }
    }

    @Test
    void noDiscountsOmitSectionAndKeepTotals() throws Exception {
        BudgetItem item = BudgetItem.builder().id(1L).description("Kitchen install")
                .quantity(BigDecimal.ONE).unitPrice(new BigDecimal("1000.00"))
                .totalPrice(new BigDecimal("1000.00")).orderNum(1).build();
        try (PDDocument doc = render(List.of(item), List.of())) {
            assertThat(text(doc)).contains("Total Final", "1.000,00").doesNotContain("Descuentos");
        }
    }

    @Test
    void thirtyFiveItemsSpanMultiplePages() throws Exception {
        String[] zones = {"Cocina", "Baño", "Salón", "Exterior"};
        List<BudgetItem> items = new ArrayList<>();
        for (int i = 1; i <= 35; i++) {
            items.add(BudgetItem.builder().id((long) i).description("Item " + i)
                    .zone(zones[(i - 1) % 4]).quantity(BigDecimal.ONE)
                    .unitPrice(BigDecimal.ONE).totalPrice(BigDecimal.ONE).orderNum(i).build());
        }
        try (PDDocument doc = render(items, List.of())) {
            assertThat(doc.getNumberOfPages()).isGreaterThan(1);
            assertThat(text(doc)).contains("Item 1", "Item 35", "Cocina");
        }
    }

    @Test
    void generatePdfDeniesOperatorWithoutProjectAssignment() {
        when(budgetService.findById(42L))
                .thenThrow(new IllegalArgumentException("Access denied: not assigned to this project"));

        assertThatThrownBy(() -> service.generatePdf(42L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Access denied: not assigned to this project");
    }

    @Test
    void generatePdfStillMapsMissingBudgetToNotFound() {
        when(budgetService.findById(42L)).thenThrow(new IllegalArgumentException("Budget not found"));

        assertThatThrownBy(() -> service.generatePdf(42L))
                .isInstanceOf(BudgetNotFoundException.class);
    }

    @Test
    void includesIvaTrueTotalFinalEqualsFinalAmountNotIvaOnTop() throws Exception {
        Budget budget = budgetWithIva(new BigDecimal("1000.00"), new BigDecimal("100.00"),
                new BigDecimal("900.00"), true);
        try (PDDocument doc = render(budget, List.of(item("IVA item")), List.of())) {
            String pdfText = text(doc);
            assertThat(pdfText).contains("Total Final", "900,00", "IVA 21%");
            assertThat(pdfText).doesNotContain("1.110,00");
        }
    }

    @Test
    void includesIvaFalseTotalFinalEqualsFinalAmountWithoutIvaLine() throws Exception {
        Budget budget = budgetWithIva(new BigDecimal("1000.00"), BigDecimal.ZERO,
                new BigDecimal("1000.00"), false);
        try (PDDocument doc = render(budget, List.of(item("No IVA item")), List.of())) {
            String pdfText = text(doc);
            assertThat(pdfText).contains("Total Final", "1.000,00");
            assertThat(pdfText).doesNotContain("IVA 21%", "1.210,00");
        }
    }

    private BudgetService newBudgetService(BudgetRepository budgetRepository, UserRepository userRepository,
            InvoiceRepository invoiceRepository) {
        return new BudgetService(budgetRepository, budgetItemRepository, budgetDiscountRepository,
                mock(ProjectRepository.class), userRepository, invoiceRepository,
                mock(InvoiceItemRepository.class), mock(InvoiceYearSequenceRepository.class),
                mock(DocumentLifecycleEventRepository.class));
    }

    @Test
    void createNewVersionPreservesIncludesIva() {
        BudgetRepository budgetRepository = mock(BudgetRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        BudgetService budgetService = newBudgetService(budgetRepository, userRepository, invoiceRepository);

        Project project = Project.builder().id(1L).build();
        Budget original = Budget.builder().id(1L).version(1).status(BudgetStatus.APPROVED)
                .project(project).includesIva(true)
                .totalAmount(new BigDecimal("10000")).build();

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(original));
        when(invoiceRepository.existsByProjectIdAndStatus(1L, InvoiceStatus.ISSUED)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        assertThat(budgetService.createNewVersion(1L, 1L).isIncludesIva()).isTrue();
    }

    @Test
    void addItemRecalculatesBudgetTotals() {
        BudgetRepository budgetRepository = mock(BudgetRepository.class);
        BudgetService budgetService = newBudgetService(budgetRepository,
                mock(UserRepository.class), mock(InvoiceRepository.class));

        Budget budget = Budget.builder().id(1L).status(BudgetStatus.DRAFT)
                .totalAmount(BigDecimal.ZERO).discountAmount(BigDecimal.ZERO)
                .finalAmount(BigDecimal.ZERO).build();
        BudgetItem item = BudgetItem.builder().description("Labor")
                .quantity(BigDecimal.ONE).unitPrice(new BigDecimal("500"))
                .totalPrice(new BigDecimal("500")).build();

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));
        when(budgetItemRepository.save(any(BudgetItem.class))).thenAnswer(i -> i.getArgument(0));
        when(budgetItemRepository.findByBudgetIdOrderByOrderNum(1L)).thenReturn(List.of(
                BudgetItem.builder().totalPrice(new BigDecimal("500")).build()));
        when(budgetDiscountRepository.findByBudgetId(1L)).thenReturn(List.of());
        when(budgetRepository.save(any(Budget.class))).thenAnswer(i -> i.getArgument(0));

        budgetService.addItem(1L, item);

        assertThat(budget.getTotalAmount()).isEqualByComparingTo("500");
        assertThat(budget.getFinalAmount()).isEqualByComparingTo("500");
    }

    private Budget budgetWithIva(BigDecimal total, BigDecimal discount, BigDecimal finalAmount, boolean includesIva) {
        return Budget.builder().id(42L).version(1)
                .client(Client.builder().name("Acme Corp").build())
                .project(Project.builder().name("Oficina Central").build())
                .totalAmount(total).discountAmount(discount).finalAmount(finalAmount)
                .includesIva(includesIva).build();
    }

    private BudgetItem item(String description) {
        return BudgetItem.builder().id(1L).description(description).quantity(BigDecimal.ONE)
                .unitPrice(new BigDecimal("1000.00")).totalPrice(new BigDecimal("1000.00")).orderNum(1).build();
    }
}
