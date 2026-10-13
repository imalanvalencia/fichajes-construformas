package es.construformas.api.controller;

import es.construformas.api.model.Role;
import es.construformas.api.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /**
     * Role catalog. Exposed so the user-management UI can build the many-to-many
     * {@code roles} payload with real ids instead of guessing them.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Role>> getAll() {
        return ResponseEntity.ok(roleService.findAll());
    }
}
