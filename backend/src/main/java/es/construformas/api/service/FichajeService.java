package es.construformas.api.service;

import es.construformas.api.model.Fichaje;
import es.construformas.api.model.TipoFichaje;
import es.construformas.api.repository.FichajeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class FichajeService {

    private final FichajeRepository fichajeRepository;

    public FichajeService(FichajeRepository fichajeRepository) {
        this.fichajeRepository = fichajeRepository;
    }

    public Fichaje registrar(Fichaje fichaje) {
        return fichajeRepository.save(fichaje);
    }

    @Transactional(readOnly = true)
    public List<Fichaje> buscarPorUsuarioYRango(
            Long usuarioId, LocalDateTime inicio, LocalDateTime fin) {
        return fichajeRepository.findFichajesByUsuarioAndRango(usuarioId, inicio, fin);
    }

    @Transactional(readOnly = true)
    public List<Fichaje> buscarPorObraYRango(
            Long obraId, LocalDateTime inicio, LocalDateTime fin) {
        return fichajeRepository.findByObraIdAndFechaHoraBetween(obraId, inicio, fin);
    }

    @Transactional(readOnly = true)
    public List<Fichaje> buscarPorTipo(Long usuarioId, TipoFichaje tipo) {
        return fichajeRepository.findByUsuarioIdAndTipoFichaje(usuarioId, tipo);
    }

    public void eliminar(Long id) {
        if (!fichajeRepository.existsById(id)) {
            throw new IllegalArgumentException("Fichaje no encontrado: " + id);
        }
        fichajeRepository.deleteById(id);
    }
}
