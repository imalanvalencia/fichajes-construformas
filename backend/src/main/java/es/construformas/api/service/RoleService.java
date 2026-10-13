package es.construformas.api.service;

import es.construformas.api.model.Role;
import es.construformas.api.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;

    /**
     * The role catalog. The frontend needs real role ids to build the many-to-many
     * `roles` payload, and there is no other way to obtain them.
     */
    public List<Role> findAll() {
        return roleRepository.findAll();
    }
}
