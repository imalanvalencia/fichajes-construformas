package es.construformas.api.service;

import es.construformas.api.dto.AuthResponse;
import es.construformas.api.dto.LoginRequest;
import es.construformas.api.dto.RegisterRequest;
import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = findUser(request);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName())
                .toList();

        if (roles.isEmpty()) {
            roles = List.of(UserRole.OPERATOR.name());
        }

        String token = jwtUtil.generateToken(user.getEmail(), roles);

        return AuthResponse.builder()
                .accessToken(token)
                .email(user.getEmail())
                .roles(roles)
                .name(user.getName())
                .build();
    }

    private User findUser(LoginRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            return userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        }
        if (request.getNie() != null && !request.getNie().isBlank()) {
            return userRepository.findByNie(request.getNie())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        }
        throw new IllegalArgumentException("Email or NIE is required");
    }

    /** @deprecated Registration removed — ADMIN-only user creation via UserController. */
    @Deprecated
    public AuthResponse register(RegisterRequest request) {
        throw new UnsupportedOperationException("Registration removed. Use POST /api/users (ADMIN only).");
    }
}
