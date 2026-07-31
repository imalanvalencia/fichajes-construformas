package es.construformas.api.service;

import es.construformas.api.dto.AuthResponse;
import es.construformas.api.dto.LoginRequest;
import es.construformas.api.model.Role;
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

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @InjectMocks private AuthService authService;

    private User buildUser(String email, String password, Set<Role> roles) {
        return User.builder()
                .id(1L).email(email).password(password)
                .roles(roles).name("Test").active(true).build();
    }

    @Test
    @DisplayName("Login with email and correct credentials should return token")
    void shouldLoginSuccessfullyWithEmail() {
        Role adminRole = Role.builder().id(1L).name("ADMIN").build();
        User user = buildUser("test@test.com", "hashed", Set.of(adminRole));

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("test@test.com", List.of("ADMIN"))).thenReturn("token123");

        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");
        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("token123");
        assertThat(response.getEmail()).isEqualTo("test@test.com");
        assertThat(response.getRoles()).containsExactly("ADMIN");
        assertThat(response.getName()).isEqualTo("Test");
    }

    @Test
    @DisplayName("Login with nie should return token")
    void shouldLoginSuccessfullyWithNie() {
        Role opRole = Role.builder().id(2L).name("OPERATOR").build();
        User user = User.builder()
                .id(2L).email("op@test.com").password("hashed").nie("12345678A")
                .roles(Set.of(opRole)).name("Op").active(true).build();

        when(userRepository.findByNie("12345678A")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("op@test.com", List.of("OPERATOR"))).thenReturn("tokenNie");

        LoginRequest request = new LoginRequest();
        request.setNie("12345678A");
        request.setPassword("pass");
        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("tokenNie");
        assertThat(response.getRoles()).containsExactly("OPERATOR");
    }

    @Test
    @DisplayName("Login with wrong password should throw")
    void shouldRejectInvalidPassword() {
        Role adminRole = Role.builder().id(1L).name("ADMIN").build();
        User user = buildUser("test@test.com", "hashed", Set.of(adminRole));

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("wrong");
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("Login with no email and no nie should throw")
    void shouldRejectMissingCredentials() {
        LoginRequest request = new LoginRequest();
        request.setPassword("pass");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email or NIE is required");
    }

    @Test
    @DisplayName("Register should throw UnsupportedOperationException")
    void shouldRejectRegister() {
        assertThatThrownBy(() -> authService.register(null))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
