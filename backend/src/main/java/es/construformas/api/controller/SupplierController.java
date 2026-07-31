package es.construformas.api.controller;

import es.construformas.api.model.Supplier;
import es.construformas.api.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<Supplier> create(@Valid @RequestBody Supplier supplier) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(supplier));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<Supplier>> getAll() {
        return ResponseEntity.ok(supplierService.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Supplier>> search(@RequestParam String name) {
        return ResponseEntity.ok(supplierService.search(name));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @RequestBody Supplier supplier) {
        return ResponseEntity.ok(supplierService.update(id, supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
