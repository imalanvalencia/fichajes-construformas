package es.construformas.api.controller;

import es.construformas.api.dto.UserDTO;
import es.construformas.api.dto.ChangePasswordRequest;
import es.construformas.api.model.UserRole;
import es.construformas.api.model.User;
import es.construformas.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @Operation(summary = "Create a new user", responses = {
            @ApiResponse(responseCode = "201", description = "User created"),
            @ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<User> create(@Valid @RequestBody UserDTO dto) {
        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .role(dto.getRole() != null ? dto.getRole() : UserRole.OPERATOR)
                .phone(dto.getPhone())
                .nie(dto.getNie())
                .active(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> findById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Get users by role")
    public ResponseEntity<List<User>> findByRole(@PathVariable UserRole role) {
        return ResponseEntity.ok(userService.findByRole(role));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user")
    public ResponseEntity<User> update(
            @PathVariable Long id, @Valid @RequestBody UserDTO dto) {
        try {
            User user = User.builder()
                    .name(dto.getName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .nie(dto.getNie())
                    .active(dto.isActive())
                    .build();

            return ResponseEntity.ok(userService.update(id, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/change-password")
    @Operation(summary = "Change user password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
