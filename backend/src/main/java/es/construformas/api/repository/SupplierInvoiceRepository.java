package es.construformas.api.repository;

import es.construformas.api.model.SupplierInvoice;
import es.construformas.api.model.SupplierInvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Long> {
    List<SupplierInvoice> findBySupplierId(Long supplierId);
    List<SupplierInvoice> findByProjectId(Long projectId);
    List<SupplierInvoice> findByStatus(SupplierInvoiceStatus status);
}
