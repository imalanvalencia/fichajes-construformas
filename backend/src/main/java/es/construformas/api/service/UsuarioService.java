package es.construformas.api.service;

import es.construformas.api.model.Usuario;
import es.construformas.api.model.RolUsuario;
import es.construformas.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario crear(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("Email ya registrado: " + usuario.getEmail());
        }
        if (usuario.getNie() != null && usuarioRepository.existsByNie(usuario.getNie())) {
            throw new IllegalArgumentException("NIE ya registrado: " + usuario.getNie());
        }
        return usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarPorRol(RolUsuario rol) {
        return usuarioRepository.findByRol(rol);
    }

    public Usuario actualizar(Long id, Usuario datos) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + id));

        usuario.setNombre(datos.getNombre());
        if (datos.getTelefono() != null) {
            usuario.setTelefono(datos.getTelefono());
        }
        if (datos.getNie() != null) {
            usuario.setNie(datos.getNie());
        }
        usuario.setActivo(datos.isActivo());

        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario no encontrado: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}
