package es.construformas.api.repository;

import es.construformas.api.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByActive(boolean active);
    Optional<PaymentMethod> findByName(String name);
}
