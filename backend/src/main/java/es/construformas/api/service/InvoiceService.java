package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final RectifyingInvoiceRepository rectifyingInvoiceRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public Invoice create(Invoice invoice) {
        Project project = projectRepository.findById(invoice.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        Client client = clientRepository.findById(invoice.getClient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        User creator = userRepository.findById(invoice.getCreatedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        invoice.setProject(project);
        invoice.setClient(client);
        invoice.setCreatedBy(creator);
        if (invoice.getStatus() == null) invoice.setStatus(InvoiceStatus.DRAFT);
        if (invoice.getSubtotal() == null) invoice.setSubtotal(BigDecimal.ZERO);
        if (invoice.getTaxRate() == null) invoice.setTaxRate(new BigDecimal("21.00"));
        if (invoice.getTaxAmount() == null) invoice.setTaxAmount(BigDecimal.ZERO);
        if (invoice.getTotal() == null) invoice.setTotal(BigDecimal.ZERO);

        return invoiceRepository.save(invoice);
    }

    public Invoice findById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
    }

    public List<Invoice> findByProject(Long projectId) {
        return invoiceRepository.findByProjectId(projectId);
    }

    public List<Invoice> findByClient(Long clientId) {
        return invoiceRepository.findByClientId(clientId);
    }

    public Invoice update(Long id, Invoice updated) {
        Invoice existing = findById(id);

        if (existing.getStatus() == InvoiceStatus.ISSUED || existing.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Cannot modify an invoice that has been issued or paid");
        }

        existing.setInvoiceNumber(updated.getInvoiceNumber());
        existing.setSubtotal(updated.getSubtotal());
        existing.setTaxRate(updated.getTaxRate());
        existing.setTaxAmount(updated.getTaxAmount());
        existing.setTotal(updated.getTotal());
        existing.setIssuedDate(updated.getIssuedDate());
        existing.setDueDate(updated.getDueDate());
        existing.setNotes(updated.getNotes());
        existing.setStatus(updated.getStatus());

        return invoiceRepository.save(existing);
    }

    public void delete(Long id) {
        Invoice invoice = findById(id);
        if (invoice.getStatus() == InvoiceStatus.ISSUED || invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Cannot delete an invoice that has been issued or paid");
        }
        invoiceRepository.deleteById(id);
    }

    public Invoice issue(Long id) {
        Invoice invoice = findById(id);
        if (invoice.getStatus() == InvoiceStatus.ISSUED || invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Invoice is already issued or paid");
        }
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isBlank()) {
            throw new IllegalArgumentException("Invoice number is required before issuing");
        }
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setIssuedDate(LocalDate.now());
        return invoiceRepository.save(invoice);
    }

    public RectifyingInvoice createRectifying(Long originalInvoiceId, RectifyingInvoice rectifying, Long userId) {
        Invoice original = findById(originalInvoiceId);
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        rectifying.setOriginalInvoice(original);
        rectifying.setCreatedBy(creator);
        if (rectifying.getStatus() == null) rectifying.setStatus(RectifyingInvoiceStatus.DRAFT);

        return rectifyingInvoiceRepository.save(rectifying);
    }

    public InvoiceItem addItem(Long invoiceId, InvoiceItem item) {
        Invoice invoice = findById(invoiceId);
        item.setInvoice(invoice);
        if (item.getOrderNum() == null) item.setOrderNum(0);
        return invoiceItemRepository.save(item);
    }

    public List<InvoiceItem> getItems(Long invoiceId) {
        return invoiceItemRepository.findByInvoiceIdOrderByOrderNum(invoiceId);
    }

    public void recalculateTotals(Long invoiceId) {
        Invoice invoice = findById(invoiceId);
        List<InvoiceItem> items = getItems(invoiceId);

        BigDecimal subtotal = items.stream()
                .map(InvoiceItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxAmount = subtotal.multiply(invoice.getTaxRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotal(subtotal.add(taxAmount));

        invoiceRepository.save(invoice);
    }
}
