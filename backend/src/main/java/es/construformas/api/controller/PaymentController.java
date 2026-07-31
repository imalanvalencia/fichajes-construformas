package es.construformas.api.controller;

import es.construformas.api.model.Payment;
import es.construformas.api.model.PaymentMethod;
import es.construformas.api.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> create(@Valid @RequestBody Payment payment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(payment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.findById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Payment>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(paymentService.findByProject(projectId));
    }

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethod>> getPaymentMethods() {
        return ResponseEntity.ok(paymentService.getPaymentMethods());
    }
}
