package es.construformas.api.service;

import es.construformas.api.dto.AuthResponse;
import es.construformas.api.dto.LoginRequest;
import es.construformas.api.dto.RegisterRequest;
import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @InjectMocks private AuthService authService;

    @Test
    @DisplayName("Login with correct credentials should return token")
    void shouldLoginSuccessfully() {
        User user = User.builder()
                .id(1L).email("test@test.com").password("hashed")
                .role(UserRole.ADMIN).name("Test").active(true).build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("test@test.com", "ADMIN")).thenReturn("token123");

        AuthResponse response = authService.login(new LoginRequest("test@test.com", "password"));

        assertThat(response.getToken()).isEqualTo("token123");
        assertThat(response.getEmail()).isEqualTo("test@test.com");
        assertThat(response.getRole()).isEqualTo("ADMIN");
        assertThat(response.getName()).isEqualTo("Test");
    }

    @Test
    @DisplayName("Login with wrong password should throw")
    void shouldRejectInvalidPassword() {
        User user = User.builder()
                .id(1L).email("test@test.com").password("hashed")
                .role(UserRole.ADMIN).active(true).build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("test@test.com", "wrong")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("Login with non-existent email should throw")
    void shouldRejectNonExistentUser() {
        when(userRepository.findByEmail("nobody@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("nobody@test.com", "pass")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("Register new user should save and return token")
    void shouldRegisterNewUser() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("hashed");
        when(jwtUtil.generateToken("new@test.com", "OPERATOR")).thenReturn("token456");

        RegisterRequest request = new RegisterRequest("New User", "new@test.com", "password", "123456789", "12345678A");
        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("token456");
        assertThat(response.getRole()).isEqualTo("OPERATOR");
        assertThat(response.getEmail()).isEqualTo("new@test.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register with existing email should throw")
    void shouldRejectDuplicateEmail() {
        when(userRepository.existsByEmail("dup@test.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest("Dup", "dup@test.com", "password", null, null);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email already registered");
    }
}
