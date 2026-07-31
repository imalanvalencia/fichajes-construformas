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
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class InvoiceIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private InvoiceRepository invoiceRepository;

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
    void shouldCreateAndIssueInvoice() throws Exception {
        String invoiceJson = objectMapper.writeValueAsString(
            Invoice.builder()
                .project(testProject).client(testClient).createdBy(testUser)
                .invoiceNumber("INV-2024-001")
                .subtotal(new BigDecimal("10000")).taxRate(new BigDecimal("21"))
                .taxAmount(new BigDecimal("2100")).total(new BigDecimal("12100"))
                .status(InvoiceStatus.DRAFT).build());

        String createResponse = mockMvc.perform(post("/api/invoices")
                .contentType(MediaType.APPLICATION_JSON).content(invoiceJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.invoiceNumber").value("INV-2024-001"))
            .andExpect(jsonPath("$.status").value("DRAFT"))
            .andReturn().getResponse().getContentAsString();

        Long invoiceId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(post("/api/invoices/" + invoiceId + "/issue"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ISSUED"));
    }

    @Test
    void shouldNotModifyIssuedInvoice() throws Exception {
        Invoice invoice = invoiceRepository.save(Invoice.builder()
            .project(testProject).client(testClient).createdBy(testUser)
            .invoiceNumber("INV-2024-002").status(InvoiceStatus.ISSUED)
            .subtotal(new BigDecimal("5000")).taxRate(new BigDecimal("21"))
            .taxAmount(new BigDecimal("1050")).total(new BigDecimal("6050"))
            .issuedDate(LocalDate.now()).build());

        String updateJson = objectMapper.writeValueAsString(
            Invoice.builder().invoiceNumber("MODIFIED").build());

        mockMvc.perform(put("/api/invoices/" + invoice.getId())
                .contentType(MediaType.APPLICATION_JSON).content(updateJson))
            .andExpect(status().is5xxServerError());
    }

    @Test
    void shouldReturnFinancialSummary() throws Exception {
        mockMvc.perform(get("/api/projects/" + testProject.getId() + "/financial-summary"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.projectId").value(testProject.getId()))
            .andExpect(jsonPath("$.totalBudgeted").value(0))
            .andExpect(jsonPath("$.totalInvoiced").value(0));
    }
}
