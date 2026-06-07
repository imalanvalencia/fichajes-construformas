package es.construformas.api.repository;

import es.construformas.api.model.Usuario;
import es.construformas.api.model.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByNie(String nie);

    Optional<Usuario> findByTelefono(String telefono);

    List<Usuario> findByRol(RolUsuario rol);

    List<Usuario> findByObraId(Long obraId);

    boolean existsByEmail(String email);

    boolean existsByNie(String nie);
}
