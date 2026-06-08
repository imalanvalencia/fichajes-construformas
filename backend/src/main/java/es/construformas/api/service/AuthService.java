package es.construformas.api.service;

import es.construformas.api.dto.AuthResponse;
import es.construformas.api.dto.LoginRequest;
import es.construformas.api.dto.RegisterRequest;
import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import es.construformas.api.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserService userService,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(),
                user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());

        return new AuthResponse(user.getId(), token, user.getEmail(),
                user.getRole().name());
    }

    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .nie(request.getNie())
                .role(UserRole.OPERATOR)
                .active(true)
                .build();

        User saved = userService.create(user);

        String token = jwtUtil.generateToken(
                saved.getEmail(), saved.getRole().name());

        return new AuthResponse(saved.getId(), token, saved.getEmail(),
                saved.getRole().name());
    }
}
