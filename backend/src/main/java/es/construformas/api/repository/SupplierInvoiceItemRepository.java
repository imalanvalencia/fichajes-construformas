package es.construformas.api.repository;

import es.construformas.api.model.SupplierInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierInvoiceItemRepository extends JpaRepository<SupplierInvoiceItem, Long> {
    List<SupplierInvoiceItem> findBySupplierInvoiceId(Long supplierInvoiceId);
}
