package es.construformas.api.service;

import es.construformas.api.exception.UserNotFoundException;
import es.construformas.api.model.Role;
import es.construformas.api.model.User;
import es.construformas.api.model.UserAvailability;
import es.construformas.api.model.UserRole;
import es.construformas.api.repository.RoleRepository;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (user.getNie() != null && userRepository.existsByNie(user.getNie())) {
            throw new IllegalArgumentException("NIE already exists");
        }
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role operatorRole = roleRepository.findByName("OPERATOR")
                    .orElseThrow(() -> new RuntimeException("OPERATOR role not found"));
            user.setRoles(Set.of(operatorRole));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    /**
     * Resolve a user on behalf of the authenticated caller (S3). An OPERATOR may only
     * read its own record; an ADMIN may read any record.
     */
    public User findByIdForCaller(Long id) {
        User caller = SecurityUtils.getCurrentUser(userRepository);
        if (!isAdmin(caller) && !caller.getId().equals(id)) {
            throw new AccessDeniedException("Operators may only read their own record");
        }
        return findById(id);
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> findByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public User update(Long id, User updated) {
        User existing = findById(id);

        String newEmail = updated.getEmail();
        if (newEmail != null && !newEmail.equals(existing.getEmail())) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email already exists");
            }
            existing.setEmail(newEmail);
        }

        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        if (updated.getNie() != null) existing.setNie(updated.getNie());
        if (updated.getRoles() != null && !updated.getRoles().isEmpty()) {
            existing.setRoles(updated.getRoles());
        }
        if (updated.getAvailability() != null) existing.setAvailability(updated.getAvailability());
        existing.setActive(updated.isActive());
        return userRepository.save(existing);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    public UserAvailability getAvailability(Long id) {
        return findById(id).getAvailability();
    }

    public UserAvailability updateAvailability(Long id, UserAvailability availability) {
        User user = findById(id);
        user.setAvailability(availability);
        userRepository.save(user);
        return availability;
    }
}
