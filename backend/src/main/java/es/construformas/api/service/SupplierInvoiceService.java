package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierInvoiceService {

    private final SupplierInvoiceRepository supplierInvoiceRepository;
    private final SupplierInvoiceItemRepository supplierInvoiceItemRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public SupplierInvoice create(SupplierInvoice invoice) {
        Supplier supplier = supplierRepository.findById(invoice.getSupplier().getId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        User creator = userRepository.findById(invoice.getCreatedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        invoice.setSupplier(supplier);
        invoice.setCreatedBy(creator);
        if (invoice.getStatus() == null) invoice.setStatus(SupplierInvoiceStatus.RECEIVED);

        return supplierInvoiceRepository.save(invoice);
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
