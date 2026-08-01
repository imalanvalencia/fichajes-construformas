package es.construformas.api.repository;

import es.construformas.api.model.SupplierInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierInvoiceItemRepository extends JpaRepository<SupplierInvoiceItem, Long> {
    List<SupplierInvoiceItem> findBySupplierInvoiceId(Long supplierInvoiceId);
}
