package es.construformas.api.security;

import es.construformas.api.model.User;
import es.construformas.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityUtilsTest {

    @Mock private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("getCurrentUserEmail should return email from SecurityContext")
    void shouldReturnEmailFromSecurityContext() {
        var auth = new UsernamePasswordAuthenticationToken(
                "user@test.com", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        String email = SecurityUtils.getCurrentUserEmail();

        assertThat(email).isEqualTo("user@test.com");
    }

    @Test
    @DisplayName("getCurrentUserEmail should throw when no authentication")
    void shouldThrowWhenNoAuthentication() {
        assertThatThrownBy(SecurityUtils::getCurrentUserEmail)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("No authenticated user");
    }

    @Test
    @DisplayName("getCurrentUser should resolve user from email")
    void shouldResolveUserFromEmail() {
        var auth = new UsernamePasswordAuthenticationToken(
                "user@test.com", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        User user = User.builder().id(1L).email("user@test.com").build();
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        User result = SecurityUtils.getCurrentUser(userRepository);

        assertThat(result).isEqualTo(user);
    }

    @Test
    @DisplayName("getCurrentUser should throw when user not found")
    void shouldThrowWhenUserNotFound() {
        var auth = new UsernamePasswordAuthenticationToken(
                "unknown@test.com", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> SecurityUtils.getCurrentUser(userRepository))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found for email");
    }

    @Test
    @DisplayName("hasRole should return true when user has the role")
    void shouldReturnTrueWhenHasRole() {
        var auth = new UsernamePasswordAuthenticationToken(
                "user@test.com", null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_OPERATOR")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThat(SecurityUtils.hasRole("ADMIN")).isTrue();
        assertThat(SecurityUtils.hasRole("OPERATOR")).isTrue();
    }

    @Test
    @DisplayName("hasRole should return false when user does not have the role")
    void shouldReturnFalseWhenDoesNotHaveRole() {
        var auth = new UsernamePasswordAuthenticationToken(
                "user@test.com", null, List.of(new SimpleGrantedAuthority("ROLE_OPERATOR")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThat(SecurityUtils.hasRole("ADMIN")).isFalse();
    }

    @Test
    @DisplayName("hasRole should return false when no authentication")
    void shouldReturnFalseWhenNoAuthentication() {
        assertThat(SecurityUtils.hasRole("ADMIN")).isFalse();
    }
}
