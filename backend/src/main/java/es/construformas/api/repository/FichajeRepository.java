package es.construformas.api.repository;

import es.construformas.api.model.Fichaje;
import es.construformas.api.model.TipoFichaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FichajeRepository extends JpaRepository<Fichaje, Long> {

    List<Fichaje> findByUsuarioIdAndFechaHoraBetween(
            Long usuarioId, LocalDateTime inicio, LocalDateTime fin);

    List<Fichaje> findByObraIdAndFechaHoraBetween(
            Long obraId, LocalDateTime inicio, LocalDateTime fin);

    List<Fichaje> findByUsuarioIdAndTipoFichaje(
            Long usuarioId, TipoFichaje tipoFichaje);

    @Query("SELECT f FROM Fichaje f WHERE f.usuario.id = :usuarioId " +
           "AND f.fechaHora BETWEEN :inicio AND :fin " +
           "ORDER BY f.fechaHora ASC")
    List<Fichaje> findFichajesByUsuarioAndRango(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
}
