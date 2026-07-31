package es.construformas.api.controller;

import es.construformas.api.model.*;
import es.construformas.api.service.PaymentService;
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
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@DisplayName("PaymentController Tests")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private Payment samplePayment() {
        Project project = Project.builder().id(1L).name("Project A").build();
        Client client = Client.builder().id(1L).name("Acme Corp").build();
        PaymentMethod method = PaymentMethod.builder().id(1L).name("Bank Transfer").build();
        User creator = User.builder().id(1L).name("Admin").build();
        return Payment.builder()
                .id(1L)
                .project(project)
                .client(client)
                .paymentMethod(method)
                .amount(new BigDecimal("5000.00"))
                .paymentDate(LocalDate.now())
                .type(PaymentType.PHASE_1)
                .createdBy(creator)
                .build();
    }

    @Test
    @DisplayName("POST /api/payments should create and return payment")
    void createPaymentShouldReturn201() throws Exception {
        when(paymentService.create(any(Payment.class))).thenReturn(samplePayment());

        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(samplePayment())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.amount").value(5000.00));
    }

    @Test
    @DisplayName("GET /api/payments/{id} should return payment")
    void getByIdShouldReturnPayment() throws Exception {
        when(paymentService.findById(1L)).thenReturn(samplePayment());

        mockMvc.perform(get("/api/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(5000.00));
    }

    @Test
    @DisplayName("GET /api/payments/project/{projectId} should return payments")
    void getByProjectShouldReturnPayments() throws Exception {
        when(paymentService.findByProject(1L)).thenReturn(List.of(samplePayment()));

        mockMvc.perform(get("/api/payments/project/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].amount").value(5000.00));
    }

    @Test
    @DisplayName("GET /api/payments/methods should return payment methods")
    void getPaymentMethodsShouldReturnList() throws Exception {
        PaymentMethod method = PaymentMethod.builder().id(1L).name("Cash").active(true).build();
        when(paymentService.getPaymentMethods()).thenReturn(List.of(method));

        mockMvc.perform(get("/api/payments/methods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Cash"));
    }
}
