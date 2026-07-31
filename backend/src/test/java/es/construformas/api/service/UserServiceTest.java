package es.construformas.api.service;

import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import es.construformas.api.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private UserService userService;

    @Test
    @DisplayName("Create user should save and return")
    void shouldCreateUser() {
        User user = User.builder().name("Test").email("test@test.com").role(UserRole.OPERATOR).build();
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });

        User result = userService.create(user);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("test@test.com");
    }

    @Test
    @DisplayName("Create user with existing email should throw")
    void shouldNotCreateDuplicateEmail() {
        when(userRepository.existsByEmail("dup@test.com")).thenReturn(true);

        User user = User.builder().name("Dup").email("dup@test.com").role(UserRole.OPERATOR).build();
        assertThatThrownBy(() -> userService.create(user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email already exists");
    }

    @Test
    @DisplayName("Create user with existing NIE should throw")
    void shouldNotCreateDuplicateNie() {
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(userRepository.existsByNie("12345678A")).thenReturn(true);

        User user = User.builder().name("Dup").email("test@test.com")
                .nie("12345678A").role(UserRole.OPERATOR).build();

        assertThatThrownBy(() -> userService.create(user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("NIE already exists");
    }

    @Test
    @DisplayName("Find by ID should return user when exists")
    void shouldFindById() {
        User user = User.builder().id(1L).name("Test").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test");
    }

    @Test
    @DisplayName("Find by ID should throw when not found")
    void shouldThrowWhenNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
    }

    @Test
    @DisplayName("Find all should delegate to repository")
    void shouldFindAll() {
        when(userRepository.findAll()).thenReturn(List.of(
                User.builder().id(1L).name("A").build(),
                User.builder().id(2L).name("B").build()
        ));

        var result = userService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Find by role should delegate to repository")
    void shouldFindByRole() {
        when(userRepository.findByRole(UserRole.ADMIN)).thenReturn(List.of(
                User.builder().id(1L).role(UserRole.ADMIN).build()
        ));

        var result = userService.findByRole(UserRole.ADMIN);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRole()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    @DisplayName("Update should merge non-null fields and save")
    void shouldUpdateUser() {
        User existing = User.builder().id(1L).name("Old").phone("111").nie("A").active(true).build();
        User updated = User.builder().name("New").phone("222").nie("B").active(false).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.update(1L, updated);

        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getPhone()).isEqualTo("222");
        assertThat(result.getNie()).isEqualTo("B");
        assertThat(result.isActive()).isFalse();
    }

    @Test
    @DisplayName("Delete should delegate to repository")
    void shouldDeleteUser() {
        userService.delete(1L);
        verify(userRepository).deleteById(1L);
    }
}
