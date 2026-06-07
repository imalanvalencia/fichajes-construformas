package es.construformas.api.service;

import es.construformas.api.model.Obra;
import es.construformas.api.repository.ObraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ObraService {

    private final ObraRepository obraRepository;

    public ObraService(ObraRepository obraRepository) {
        this.obraRepository = obraRepository;
    }

    public Obra crear(Obra obra) {
        return obraRepository.save(obra);
    }

    @Transactional(readOnly = true)
    public Optional<Obra> buscarPorId(Long id) {
        return obraRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Obra> listarTodas() {
        return obraRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Obra> buscarPorNombre(String nombre) {
        return obraRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Obra actualizar(Long id, Obra datos) {
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Obra no encontrada: " + id));

        obra.setNombre(datos.getNombre());
        obra.setDireccion(datos.getDireccion());
        obra.setLatitud(datos.getLatitud());
        obra.setLongitud(datos.getLongitud());
        obra.setRadioPermitidoMetros(datos.getRadioPermitidoMetros());
        obra.setActiva(datos.isActiva());

        return obraRepository.save(obra);
    }

    public void eliminar(Long id) {
        if (!obraRepository.existsById(id)) {
            throw new IllegalArgumentException("Obra no encontrada: " + id);
        }
        obraRepository.deleteById(id);
    }
}
