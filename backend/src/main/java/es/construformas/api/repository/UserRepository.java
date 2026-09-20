package es.construformas.api.repository;

import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNie(String nie);
    Optional<User> findByPhone(String phone);
    @Deprecated List<User> findByRole(UserRole role);
    List<User> findByActive(boolean active);
    boolean existsByEmail(String email);
    boolean existsByNie(String nie);
}
