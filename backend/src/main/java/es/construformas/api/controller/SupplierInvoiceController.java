package es.construformas.api.controller;

import es.construformas.api.dto.SupplierInvoiceRequest;
import es.construformas.api.model.SupplierInvoice;
import es.construformas.api.model.SupplierInvoiceStatus;
import es.construformas.api.service.SupplierInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-invoices")
@RequiredArgsConstructor
public class SupplierInvoiceController {
    private final SupplierInvoiceService supplierInvoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<SupplierInvoice>> getAll() {
        return ResponseEntity.ok(supplierInvoiceService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierInvoice> create(@Valid @RequestBody SupplierInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierInvoiceService.create(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<SupplierInvoice> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierInvoiceService.findById(id));
    }

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<SupplierInvoice>> getBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(supplierInvoiceService.findBySupplier(supplierId));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<List<SupplierInvoice>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(supplierInvoiceService.findByProject(projectId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupplierInvoice> updateStatus(@PathVariable Long id, @RequestParam SupplierInvoiceStatus status) {
        return ResponseEntity.ok(supplierInvoiceService.updateStatus(id, status));
    }
}
