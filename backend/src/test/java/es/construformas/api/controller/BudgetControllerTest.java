package es.construformas.api.controller;

import es.construformas.api.dto.BudgetRequest;
import es.construformas.api.model.*;
import es.construformas.api.service.BudgetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import es.construformas.api.security.JwtUtil;
import es.construformas.api.security.CustomUserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BudgetController.class)
@DisplayName("BudgetController Tests")
class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BudgetService budgetService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private Budget sampleBudget() {
        Project project = Project.builder().id(1L).name("Project A").build();
        User creator = User.builder().id(1L).name("Admin").build();
        return Budget.builder()
                .id(1L)
                .project(project)
                .version(1)
                .budgetType(BudgetType.ORIGINAL)
                .status(BudgetStatus.DRAFT)
                .totalAmount(new BigDecimal("10000.00"))
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("10000.00"))
                .createdBy(creator)
                .build();
    }

    @Test
    @DisplayName("POST /api/budgets should create and return budget")
    void createBudgetShouldReturn201() throws Exception {
        when(budgetService.create(any(BudgetRequest.class))).thenReturn(sampleBudget());

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleBudget())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.version").value(1));
    }

    @Test
    @DisplayName("GET /api/budgets/{id} should return budget")
    void getByIdShouldReturnBudget() throws Exception {
        when(budgetService.findById(1L)).thenReturn(sampleBudget());

        mockMvc.perform(get("/api/budgets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("GET /api/budgets/project/{projectId} should return budgets")
    void getByProjectShouldReturnBudgets() throws Exception {
        when(budgetService.findByProject(1L)).thenReturn(List.of(sampleBudget()));

        mockMvc.perform(get("/api/budgets/project/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].version").value(1));
    }

    @Test
    @DisplayName("POST /api/budgets/{id}/new-version should create new version")
    void createNewVersionShouldReturnBudget() throws Exception {
        Budget newVersion = Budget.builder()
                .id(2L).version(2).budgetType(BudgetType.VERSION)
                .status(BudgetStatus.DRAFT).build();
        when(budgetService.createNewVersion(1L, 1L)).thenReturn(newVersion);

        mockMvc.perform(post("/api/budgets/1/new-version").param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(2));
    }

    @Test
    @DisplayName("POST /api/budgets/{id}/approve should approve budget")
    void approveShouldReturnApprovedBudget() throws Exception {
        Budget approved = sampleBudget();
        approved.setStatus(BudgetStatus.APPROVED);
        when(budgetService.approve(1L, 1L)).thenReturn(approved);

        mockMvc.perform(post("/api/budgets/1/approve").param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @DisplayName("POST /api/budgets/{id}/items should add item")
    void addItemShouldReturn201() throws Exception {
        BudgetItem item = BudgetItem.builder()
                .id(1L).description("Concrete work").totalPrice(new BigDecimal("5000.00")).build();
        when(budgetService.addItem(eq(1L), any(BudgetItem.class))).thenReturn(item);

        mockMvc.perform(post("/api/budgets/1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(item)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Concrete work"));
    }

    @Test
    @DisplayName("GET /api/budgets/{id}/items should return items")
    void getItemsShouldReturnList() throws Exception {
        BudgetItem item = BudgetItem.builder().id(1L).description("Item A").build();
        when(budgetService.getItems(1L)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/budgets/1/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].description").value("Item A"));
    }

    @Test
    @DisplayName("POST /api/budgets/{id}/discounts should add discount")
    void addDiscountShouldReturn201() throws Exception {
        BudgetDiscount discount = BudgetDiscount.builder()
                .id(1L).description("Early payment").amount(new BigDecimal("500.00")).build();
        when(budgetService.addDiscount(eq(1L), any(BudgetDiscount.class))).thenReturn(discount);

        mockMvc.perform(post("/api/budgets/1/discounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(discount)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Early payment"));
    }

    @Test
    @DisplayName("DELETE /api/budgets/{id} should return 204")
    void deleteBudgetShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/budgets/1"))
                .andExpect(status().isNoContent());

        verify(budgetService).delete(1L);
    }
}
