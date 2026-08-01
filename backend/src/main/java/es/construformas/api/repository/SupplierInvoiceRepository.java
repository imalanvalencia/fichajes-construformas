package es.construformas.api.repository;

import es.construformas.api.model.SupplierInvoice;
import es.construformas.api.model.SupplierInvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Long> {
    List<SupplierInvoice> findBySupplierId(Long supplierId);
    List<SupplierInvoice> findByProjectId(Long projectId);
    List<SupplierInvoice> findByStatus(SupplierInvoiceStatus status);
}
