package es.construformas.api.repository;

import es.construformas.api.model.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ObraRepository extends JpaRepository<Obra, Long> {

    List<Obra> findByNombreContainingIgnoreCase(String nombre);

    Optional<Obra> findByCodigo(String codigo);

    List<Obra> findByDireccionContainingIgnoreCase(String direccion);

    boolean existsByCodigo(String codigo);
}
