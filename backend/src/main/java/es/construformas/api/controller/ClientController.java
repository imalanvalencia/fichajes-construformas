package es.construformas.api.controller;

import es.construformas.api.model.Client;
import es.construformas.api.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @PostMapping
    public ResponseEntity<Client> create(@Valid @RequestBody Client client) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(client));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<Client>> getAll() {
        return ResponseEntity.ok(clientService.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Client>> search(@RequestParam String name) {
        return ResponseEntity.ok(clientService.search(name));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> update(@PathVariable Long id, @RequestBody Client client) {
        return ResponseEntity.ok(clientService.update(id, client));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
