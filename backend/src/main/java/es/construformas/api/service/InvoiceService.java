package es.construformas.api.service;

import es.construformas.api.dto.InvoiceRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import es.construformas.api.security.SecurityUtils;
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

    public Invoice create(InvoiceRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Invoice invoice = Invoice.builder()
                .project(project)
                .client(client)
                .createdBy(creator)
                .invoiceNumber(request.getInvoiceNumber())
                .status(request.getStatus() != null ? request.getStatus() : InvoiceStatus.DRAFT)
                .subtotal(request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO)
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : new BigDecimal("21.00"))
                .taxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO)
                .total(request.getTotal() != null ? request.getTotal() : BigDecimal.ZERO)
                .issuedDate(request.getIssuedDate())
                .dueDate(request.getDueDate())
                .notes(request.getNotes())
                .build();

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> findAll() {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            List<Long> projectIds = operatorProjects.stream().map(Project::getId).toList();
            return invoiceRepository.findByProjectIdIn(projectIds);
        }
        return invoiceRepository.findAll();
    }

    public Invoice findById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!projectRepository.existsByProjectIdAndOperatorId(invoice.getProject().getId(), user.getId())) {
                throw new IllegalArgumentException("Access denied: not assigned to this project");
            }
        }
        return invoice;
    }

    public List<Invoice> findByProject(Long projectId) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!projectRepository.existsByProjectIdAndOperatorId(projectId, user.getId())) {
                throw new IllegalArgumentException("Access denied: not assigned to this project");
            }
        }
        return invoiceRepository.findByProjectId(projectId);
    }

    public List<Invoice> findByClient(Long clientId) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            List<Long> projectIds = operatorProjects.stream().map(Project::getId).toList();
            return invoiceRepository.findByProjectIdIn(projectIds);
        }
        return invoiceRepository.findByClientId(clientId);
    }

    public Invoice update(Long id, InvoiceRequest request) {
        Invoice existing = findById(id);

        if (existing.getStatus() == InvoiceStatus.ISSUED || existing.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Cannot modify an invoice that has been issued or paid");
        }

        existing.setInvoiceNumber(request.getInvoiceNumber());
        existing.setSubtotal(request.getSubtotal());
        existing.setTaxRate(request.getTaxRate());
        existing.setTaxAmount(request.getTaxAmount());
        existing.setTotal(request.getTotal());
        existing.setIssuedDate(request.getIssuedDate());
        existing.setDueDate(request.getDueDate());
        existing.setNotes(request.getNotes());
        existing.setStatus(request.getStatus());

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found"));
            existing.setProject(project);
        }
        if (request.getClientId() != null) {
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found"));
            existing.setClient(client);
        }

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

    public Invoice markAsPaid(Long id) {
        Invoice invoice = findById(id);
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Invoice is already paid");
        }
        if (invoice.getStatus() == InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Cannot mark a draft invoice as paid — issue it first");
        }
        invoice.setStatus(InvoiceStatus.PAID);
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
