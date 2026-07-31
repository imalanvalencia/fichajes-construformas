package es.construformas.api.controller;

import es.construformas.api.model.Invoice;
import es.construformas.api.model.InvoiceItem;
import es.construformas.api.model.RectifyingInvoice;
import es.construformas.api.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<Invoice> create(@Valid @RequestBody Invoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(invoice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Invoice>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(invoiceService.findByProject(projectId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> update(@PathVariable Long id, @RequestBody Invoice invoice) {
        return ResponseEntity.ok(invoiceService.update(id, invoice));
    }

    @PostMapping("/{id}/issue")
    public ResponseEntity<Invoice> issue(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.issue(id));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<InvoiceItem> addItem(@PathVariable Long id, @RequestBody InvoiceItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.addItem(id, item));
    }

    @PostMapping("/{id}/rectify")
    public ResponseEntity<RectifyingInvoice> createRectifying(
            @PathVariable Long id,
            @RequestBody RectifyingInvoice rectifying,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createRectifying(id, rectifying, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
