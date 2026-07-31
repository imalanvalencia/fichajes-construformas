package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InvoiceItemRepository invoiceItemRepository;
    @Mock private RectifyingInvoiceRepository rectifyingInvoiceRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private ClientRepository clientRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private InvoiceService invoiceService;

    @Test
    @DisplayName("Create invoice should default to DRAFT status")
    void shouldCreateInvoice() {
        Project project = Project.builder().id(1L).build();
        Client client = Client.builder().id(1L).build();
        User user = User.builder().id(1L).build();
        Invoice invoice = Invoice.builder()
                .project(project).client(client).createdBy(user)
                .invoiceNumber("INV-001").build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice result = invoiceService.create(invoice);

        assertThat(result.getStatus()).isEqualTo(InvoiceStatus.DRAFT);
        assertThat(result.getInvoiceNumber()).isEqualTo("INV-001");
    }

    @Test
    @DisplayName("Create invoice with missing project should throw")
    void shouldRejectCreateWithMissingProject() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());
        Client client = Client.builder().id(1L).build();
        User user = User.builder().id(1L).build();
        Invoice invoice = Invoice.builder()
                .project(Project.builder().id(99L).build())
                .client(client).createdBy(user).build();

        assertThatThrownBy(() -> invoiceService.create(invoice))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Project not found");
    }

    @Test
    @DisplayName("Update issued invoice should throw")
    void shouldNotUpdateIssuedInvoice() {
        Invoice issued = Invoice.builder().id(1L).status(InvoiceStatus.ISSUED).build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(issued));

        Invoice updated = Invoice.builder().invoiceNumber("NEW-001").build();
        assertThatThrownBy(() -> invoiceService.update(1L, updated))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot modify");
    }

    @Test
    @DisplayName("Update paid invoice should throw")
    void shouldNotUpdatePaidInvoice() {
        Invoice paid = Invoice.builder().id(1L).status(InvoiceStatus.PAID).build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(paid));

        Invoice updated = Invoice.builder().invoiceNumber("NEW-001").build();
        assertThatThrownBy(() -> invoiceService.update(1L, updated))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot modify");
    }

    @Test
    @DisplayName("Delete issued invoice should throw")
    void shouldNotDeleteIssuedInvoice() {
        Invoice issued = Invoice.builder().id(1L).status(InvoiceStatus.ISSUED).build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(issued));

        assertThatThrownBy(() -> invoiceService.delete(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete");
    }

    @Test
    @DisplayName("Update draft invoice should succeed")
    void shouldAllowUpdateDraftInvoice() {
        Invoice draft = Invoice.builder().id(1L).status(InvoiceStatus.DRAFT).invoiceNumber("OLD")
                .subtotal(BigDecimal.ZERO).taxRate(new BigDecimal("21"))
                .taxAmount(BigDecimal.ZERO).total(BigDecimal.ZERO).build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(draft));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice updated = Invoice.builder().invoiceNumber("NEW-001")
                .subtotal(new BigDecimal("1000")).taxRate(new BigDecimal("21"))
                .taxAmount(new BigDecimal("210")).total(new BigDecimal("1210")).build();
        Invoice result = invoiceService.update(1L, updated);

        assertThat(result.getInvoiceNumber()).isEqualTo("NEW-001");
        assertThat(result.getSubtotal()).isEqualByComparingTo("1000");
        assertThat(result.getTotal()).isEqualByComparingTo("1210");
    }

    @Test
    @DisplayName("Issue invoice should set ISSUED status and date")
    void shouldIssueInvoice() {
        Invoice draft = Invoice.builder().id(1L).status(InvoiceStatus.DRAFT)
                .invoiceNumber("INV-001")
                .subtotal(BigDecimal.ZERO).taxRate(new BigDecimal("21"))
                .taxAmount(BigDecimal.ZERO).total(BigDecimal.ZERO).build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(draft));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice result = invoiceService.issue(1L);

        assertThat(result.getStatus()).isEqualTo(InvoiceStatus.ISSUED);
        assertThat(result.getIssuedDate()).isNotNull();
    }

    @Test
    @DisplayName("Issue invoice without number should throw")
    void shouldRejectIssueWithoutNumber() {
        Invoice draft = Invoice.builder().id(1L).status(InvoiceStatus.DRAFT)
                .invoiceNumber(null)
                .subtotal(BigDecimal.ZERO).taxRate(new BigDecimal("21"))
                .taxAmount(BigDecimal.ZERO).total(BigDecimal.ZERO).build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> invoiceService.issue(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invoice number is required");
    }

    @Test
    @DisplayName("Issue already-issued invoice should throw")
    void shouldRejectIssueAlreadyIssued() {
        Invoice issued = Invoice.builder().id(1L).status(InvoiceStatus.ISSUED).build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(issued));

        assertThatThrownBy(() -> invoiceService.issue(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already issued");
    }

    @Test
    @DisplayName("Create rectifying invoice should link to original")
    void shouldCreateRectifyingInvoice() {
        Invoice original = Invoice.builder().id(1L).invoiceNumber("INV-001").build();
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(original));
        User user = User.builder().id(1L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        RectifyingInvoice rectifying = RectifyingInvoice.builder()
                .subtotal(new BigDecimal("-500"))
                .taxRate(new BigDecimal("21"))
                .taxAmount(new BigDecimal("-105"))
                .total(new BigDecimal("-605"))
                .reason("Billing error")
                .build();

        when(rectifyingInvoiceRepository.save(any(RectifyingInvoice.class)))
                .thenAnswer(i -> i.getArgument(0));

        RectifyingInvoice result = invoiceService.createRectifying(1L, rectifying, 1L);

        assertThat(result.getOriginalInvoice()).isEqualTo(original);
        assertThat(result.getStatus()).isEqualTo(RectifyingInvoiceStatus.DRAFT);
    }

    @Test
    @DisplayName("Get items should delegate to repository")
    void shouldGetItems() {
        when(invoiceItemRepository.findByInvoiceIdOrderByOrderNum(1L)).thenReturn(List.of(
                InvoiceItem.builder().totalPrice(new BigDecimal("100")).build()
        ));

        var items = invoiceService.getItems(1L);

        assertThat(items).hasSize(1);
    }
}
