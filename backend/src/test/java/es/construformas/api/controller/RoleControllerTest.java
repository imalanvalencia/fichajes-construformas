package es.construformas.api.controller;

import es.construformas.api.integration.MethodSecurityTestConfig;
import es.construformas.api.model.Role;
import es.construformas.api.security.JwtAuthFilter;
import es.construformas.api.security.JwtUtil;
import es.construformas.api.service.RoleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoleController.class)
@ActiveProfiles("auth-test")
@AutoConfigureMockMvc(addFilters = false)
@Import(MethodSecurityTestConfig.class)
@DisplayName("RoleController Tests")
class RoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @DisplayName("S9: GET /api/roles should return the role catalog for an ADMIN")
    @WithMockUser(roles = "ADMIN")
    void getRolesShouldReturnCatalog() throws Exception {
        when(roleService.findAll()).thenReturn(List.of(
                Role.builder().id(1L).name("ADMIN").description("System administrator with full access").build(),
                Role.builder().id(2L).name("OPERATOR").description("Field operator with limited access").build()
        ));

        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("ADMIN"))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].name").value("OPERATOR"))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    @DisplayName("S9: GET /api/roles should return 403 for an OPERATOR")
    @WithMockUser(roles = "OPERATOR")
    void getRolesShouldBeForbiddenForOperator() throws Exception {
        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isForbidden());
    }
}
