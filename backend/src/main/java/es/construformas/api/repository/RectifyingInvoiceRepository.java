package es.construformas.api.repository;

import es.construformas.api.model.RectifyingInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RectifyingInvoiceRepository extends JpaRepository<RectifyingInvoice, Long> {
    List<RectifyingInvoice> findByOriginalInvoiceId(Long originalInvoiceId);
    Optional<RectifyingInvoice> findByRectifyingNumber(String rectifyingNumber);
}
