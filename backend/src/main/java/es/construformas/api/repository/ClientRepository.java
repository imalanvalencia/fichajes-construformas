package es.construformas.api.repository;

import es.construformas.api.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByNameContainingIgnoreCase(String name);
    List<Client> findByIdInAndNameContainingIgnoreCase(List<Long> ids, String name);
    List<Client> findByActive(boolean active);
    List<Client> findByCityIgnoreCase(String city);
}
