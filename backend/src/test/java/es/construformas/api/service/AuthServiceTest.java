package es.construformas.api.service;

import es.construformas.api.dto.AuthResponse;
import es.construformas.api.dto.LoginRequest;
import es.construformas.api.dto.RegisterRequest;
import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import es.construformas.api.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@construformas.com")
                .password("$2a$10$hashed_password")
                .role(UserRole.OPERATOR)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Login with correct credentials should return token")
    void login_correctCredentials_shouldReturnToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@construformas.com");
        request.setPassword("password123");

        when(userService.findByEmail("test@construformas.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$10$hashed_password"))
                .thenReturn(true);
        when(jwtUtil.generateToken("test@construformas.com", "OPERATOR"))
                .thenReturn("fake-jwt-token");

        AuthResponse response = authService.login(request);

        assertEquals("fake-jwt-token", response.getToken());
        assertEquals("test@construformas.com", response.getEmail());
    }

    @Test
    @DisplayName("Login with wrong email should throw")
    void login_wrongEmail_shouldThrow() {
        LoginRequest request = new LoginRequest();
        request.setEmail("wrong@construformas.com");
        request.setPassword("password123");

        when(userService.findByEmail("wrong@construformas.com"))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> authService.login(request));
    }

    @Test
    @DisplayName("Login with wrong password should throw")
    void login_wrongPassword_shouldThrow() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@construformas.com");
        request.setPassword("wrongpassword");

        when(userService.findByEmail("test@construformas.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashed_password"))
                .thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> authService.login(request));
    }

    @Test
    @DisplayName("Register new user should return token")
    void register_newUser_shouldReturnToken() {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("new@construformas.com");
        request.setPassword("pass123");

        when(passwordEncoder.encode("pass123"))
                .thenReturn("$2a$10$encoded_password");
        when(userService.create(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken("test@construformas.com", "OPERATOR"))
                .thenReturn("new-jwt-token");

        AuthResponse response = authService.register(request);

        assertEquals("new-jwt-token", response.getToken());
    }
}
