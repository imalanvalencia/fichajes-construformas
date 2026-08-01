package es.construformas.api.repository;

import es.construformas.api.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByActive(boolean active);
    Optional<PaymentMethod> findByName(String name);
}
