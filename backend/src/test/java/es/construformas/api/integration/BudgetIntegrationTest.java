package es.construformas.api.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BudgetIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private ProjectRepository projectRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder()
        .addModule(new JavaTimeModule()).build();

    private User testUser;
    private Client testClient;
    private Project testProject;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
            .name("Test User").email("test@test.com")
            .password("hashed").role(UserRole.ADMIN).build());
        testClient = clientRepository.save(Client.builder().name("Test Client").build());
        testProject = projectRepository.save(Project.builder()
            .client(testClient).name("Test Project").address("Calle 1")
            .latitude(40.0).longitude(-3.0).status(ProjectStatus.PLANNED).build());
    }

    @Test
    void shouldCreateBudgetWithItems() throws Exception {
        String budgetJson = objectMapper.writeValueAsString(
            Budget.builder()
                .project(testProject).createdBy(testUser)
                .totalAmount(new BigDecimal("20000"))
                .status(BudgetStatus.DRAFT).build());

        String response = mockMvc.perform(post("/api/budgets")
                .contentType(MediaType.APPLICATION_JSON).content(budgetJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("DRAFT"))
            .andReturn().getResponse().getContentAsString();

        Long budgetId = objectMapper.readTree(response).get("id").asLong();

        String itemJson = objectMapper.writeValueAsString(
            BudgetItem.builder().description("Fontanería").unit("ud")
                .quantity(new BigDecimal("1")).unitPrice(new BigDecimal("5000"))
                .totalPrice(new BigDecimal("5000")).build());

        mockMvc.perform(post("/api/budgets/" + budgetId + "/items")
                .contentType(MediaType.APPLICATION_JSON).content(itemJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.description").value("Fontanería"));
    }

    @Test
    void shouldCreateNewVersion() throws Exception {
        String budgetJson = objectMapper.writeValueAsString(
            Budget.builder()
                .project(testProject).createdBy(testUser)
                .totalAmount(new BigDecimal("15000"))
                .status(BudgetStatus.DRAFT).build());

        String response = mockMvc.perform(post("/api/budgets")
                .contentType(MediaType.APPLICATION_JSON).content(budgetJson))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();

        Long budgetId = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(post("/api/budgets/" + budgetId + "/approve?userId=" + testUser.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(post("/api/budgets/" + budgetId + "/new-version?userId=" + testUser.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.version").value(2))
            .andExpect(jsonPath("$.status").value("DRAFT"));
    }
}
