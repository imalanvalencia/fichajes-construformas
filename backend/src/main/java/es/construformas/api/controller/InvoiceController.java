package es.construformas.api.controller;

import es.construformas.api.model.Invoice;
import es.construformas.api.model.InvoiceItem;
import es.construformas.api.model.RectifyingInvoice;
import es.construformas.api.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> create(@Valid @RequestBody Invoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(invoice));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<Invoice>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(invoiceService.findByProject(projectId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> update(@PathVariable Long id, @RequestBody Invoice invoice) {
        return ResponseEntity.ok(invoiceService.update(id, invoice));
    }

    @PostMapping("/{id}/issue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> issue(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.issue(id));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.markAsPaid(id));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<InvoiceItem> addItem(@PathVariable Long id, @RequestBody InvoiceItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.addItem(id, item));
    }

    @PostMapping("/{id}/rectify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RectifyingInvoice> createRectifying(
            @PathVariable Long id,
            @RequestBody RectifyingInvoice rectifying,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createRectifying(id, rectifying, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
