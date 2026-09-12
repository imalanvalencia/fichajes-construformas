package es.construformas.api.integration;

import es.construformas.api.controller.*;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.security.CustomUserDetailsService;
import es.construformas.api.security.JwtAuthFilter;
import es.construformas.api.security.JwtUtil;
import es.construformas.api.service.*;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
    UserController.class,
    ProjectController.class,
    ClientController.class,
    BudgetController.class,
    InvoiceController.class,
    PaymentController.class,
    SupplierController.class,
    SupplierInvoiceController.class,
    ClockEntryController.class,
    ClockCorrectionController.class
})
@ActiveProfiles("auth-test")
@AutoConfigureMockMvc(addFilters = false)
@Import(MethodSecurityTestConfig.class)
@DisplayName("Authorization Integration Tests")
class AuthorizationIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private UserService userService;
    @MockitoBean private ProjectService projectService;
    @MockitoBean private ClientService clientService;
    @MockitoBean private BudgetService budgetService;
    @MockitoBean private InvoiceService invoiceService;
    @MockitoBean private PaymentService paymentService;
    @MockitoBean private SupplierService supplierService;
    @MockitoBean private SupplierInvoiceService supplierInvoiceService;
    @MockitoBean private ClockEntryService clockEntryService;
    @MockitoBean private ClockCorrectionService clockCorrectionService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private JwtAuthFilter jwtAuthFilter;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("OPERATOR GET /api/users (getAll) should return 403")
    @WithMockUser(roles = "OPERATOR")
    void operatorGetAllUsersShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("OPERATOR POST /api/users should be denied")
    @WithMockUser(roles = "OPERATOR")
    void operatorCreateUserShouldBeDenied() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType("application/json")
                        .content("{\"name\":\"Test\",\"email\":\"t@t.com\",\"password\":\"p\"}"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status == 200 || status == 201) {
                        throw new AssertionError("Expected non-2xx status but got " + status);
                    }
                });
    }

    @Test
    @DisplayName("ADMIN GET /api/users should return 200")
    @WithMockUser(roles = "ADMIN")
    void adminGetAllUsersShouldReturn200() throws Exception {
        when(userService.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("ADMIN GET /api/projects should return 200")
    @WithMockUser(roles = "ADMIN")
    void adminGetAllProjectsShouldReturn200() throws Exception {
        when(projectService.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("OPERATOR GET /api/clock-entries/{id} should return 200")
    @WithMockUser(roles = "OPERATOR")
    void operatorGetClockEntryByIdShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/clock-entries/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("User with no role GET /api/users should return 403")
    @WithMockUser
    void noRoleGetAllUsersShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("OPERATOR POST /api/projects should be denied")
    @WithMockUser(roles = "OPERATOR")
    void operatorCreateProjectShouldBeDenied() throws Exception {
        mockMvc.perform(post("/api/projects")
                        .contentType("application/json")
                        .content("{\"name\":\"Test\"}"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    if (status == 200 || status == 201) {
                        throw new AssertionError("Expected non-2xx status but got " + status);
                    }
                });
    }
}
