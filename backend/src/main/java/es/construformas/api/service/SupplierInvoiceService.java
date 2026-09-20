package es.construformas.api.service;

import es.construformas.api.dto.SupplierInvoiceRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierInvoiceService {

    private final SupplierInvoiceRepository supplierInvoiceRepository;
    private final SupplierInvoiceItemRepository supplierInvoiceItemRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public SupplierInvoice create(SupplierInvoiceRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SupplierInvoiceStatus status = request.getStatus() != null
                ? SupplierInvoiceStatus.valueOf(request.getStatus())
                : SupplierInvoiceStatus.RECEIVED;

        SupplierInvoice invoice = SupplierInvoice.builder()
                .supplier(supplier)
                .createdBy(creator)
                .invoiceNumber(request.getInvoiceNumber())
                .invoiceDate(parseDate(request.getInvoiceDate()))
                .subtotal(request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO)
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("21.00"))
                .taxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO)
                .total(request.getTotal() != null ? request.getTotal() : BigDecimal.ZERO)
                .status(status)
                .notes(request.getNotes())
                .build();

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found"));
            invoice.setProject(project);
        }

        return supplierInvoiceRepository.save(invoice);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateStr + ". Expected yyyy-MM-dd");
        }
    }

    public List<SupplierInvoice> findAll() {
        return supplierInvoiceRepository.findAll();
    }

    public SupplierInvoice findById(Long id) {
        return supplierInvoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier invoice not found"));
    }

    public List<SupplierInvoice> findBySupplier(Long supplierId) {
        return supplierInvoiceRepository.findBySupplierId(supplierId);
    }

    public List<SupplierInvoice> findByProject(Long projectId) {
        return supplierInvoiceRepository.findByProjectId(projectId);
    }

    public SupplierInvoice updateStatus(Long id, SupplierInvoiceStatus newStatus) {
        SupplierInvoice invoice = findById(id);
        invoice.setStatus(newStatus);
        return supplierInvoiceRepository.save(invoice);
    }

    public SupplierInvoiceItem addItem(Long invoiceId, SupplierInvoiceItem item) {
        SupplierInvoice invoice = findById(invoiceId);
        item.setSupplierInvoice(invoice);
        return supplierInvoiceItemRepository.save(item);
    }

    public List<SupplierInvoiceItem> getItems(Long invoiceId) {
        return supplierInvoiceItemRepository.findBySupplierInvoiceId(invoiceId);
    }
}
