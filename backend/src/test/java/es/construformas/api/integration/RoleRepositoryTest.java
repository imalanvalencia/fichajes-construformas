package es.construformas.api.integration;

import es.construformas.api.model.Role;
import es.construformas.api.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RoleRepositoryTest {

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    void setUp() {
        roleRepository.deleteAll();
        roleRepository.save(Role.builder().name("ADMIN").description("System admin").build());
        roleRepository.save(Role.builder().name("OPERATOR").description("Field operator").build());
    }

    @Test
    void shouldFindRoleByName() {
        Optional<Role> role = roleRepository.findByName("ADMIN");
        assertTrue(role.isPresent());
        assertEquals("ADMIN", role.get().getName());
    }

    @Test
    void shouldReturnEmptyForInvalidName() {
        Optional<Role> role = roleRepository.findByName("INVALID");
        assertTrue(role.isEmpty());
    }

    @Test
    void shouldEnforceUniqueName() {
        assertThrows(Exception.class, () ->
            roleRepository.save(Role.builder().name("ADMIN").build()));
    }
}
