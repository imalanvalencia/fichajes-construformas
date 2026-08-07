package es.construformas.api.controller;

import es.construformas.api.dto.InvoiceRequest;
import es.construformas.api.model.*;
import es.construformas.api.service.InvoiceService;
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

@WebMvcTest(InvoiceController.class)
@DisplayName("InvoiceController Tests")
class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InvoiceService invoiceService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private Invoice sampleInvoice() {
        Project project = Project.builder().id(1L).name("Project A").build();
        Client client = Client.builder().id(1L).name("Acme Corp").build();
        User creator = User.builder().id(1L).name("Admin").build();
        return Invoice.builder()
                .id(1L)
                .project(project)
                .client(client)
                .invoiceNumber("INV-001")
                .status(InvoiceStatus.DRAFT)
                .subtotal(new BigDecimal("1000.00"))
                .taxRate(new BigDecimal("21.00"))
                .taxAmount(new BigDecimal("210.00"))
                .total(new BigDecimal("1210.00"))
                .createdBy(creator)
                .build();
    }

    @Test
    @DisplayName("POST /api/invoices should create and return invoice")
    void createInvoiceShouldReturn201() throws Exception {
        when(invoiceService.create(any(InvoiceRequest.class))).thenReturn(sampleInvoice());

        mockMvc.perform(post("/api/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleInvoice())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.invoiceNumber").value("INV-001"));
    }

    @Test
    @DisplayName("GET /api/invoices/{id} should return invoice")
    void getByIdShouldReturnInvoice() throws Exception {
        when(invoiceService.findById(1L)).thenReturn(sampleInvoice());

        mockMvc.perform(get("/api/invoices/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNumber").value("INV-001"));
    }

    @Test
    @DisplayName("GET /api/invoices/project/{projectId} should return invoices")
    void getByProjectShouldReturnInvoices() throws Exception {
        when(invoiceService.findByProject(1L)).thenReturn(List.of(sampleInvoice()));

        mockMvc.perform(get("/api/invoices/project/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].invoiceNumber").value("INV-001"));
    }

    @Test
    @DisplayName("PUT /api/invoices/{id} should update invoice")
    void updateInvoiceShouldReturnUpdated() throws Exception {
        Invoice updated = Invoice.builder().invoiceNumber("INV-002").status(InvoiceStatus.DRAFT).build();
        when(invoiceService.update(eq(1L), any(InvoiceRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/invoices/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNumber").value("INV-002"));
    }

    @Test
    @DisplayName("POST /api/invoices/{id}/issue should issue invoice")
    void issueShouldReturnIssuedInvoice() throws Exception {
        Invoice issued = sampleInvoice();
        issued.setStatus(InvoiceStatus.ISSUED);
        when(invoiceService.issue(1L)).thenReturn(issued);

        mockMvc.perform(post("/api/invoices/1/issue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ISSUED"));
    }

    @Test
    @DisplayName("POST /api/invoices/{id}/items should add item")
    void addItemShouldReturn201() throws Exception {
        InvoiceItem item = InvoiceItem.builder()
                .id(1L).description("Labor").totalPrice(new BigDecimal("500.00")).build();
        when(invoiceService.addItem(eq(1L), any(InvoiceItem.class))).thenReturn(item);

        mockMvc.perform(post("/api/invoices/1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(item)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Labor"));
    }

    @Test
    @DisplayName("POST /api/invoices/{id}/rectify should create rectifying invoice")
    void createRectifyingShouldReturn201() throws Exception {
        RectifyingInvoice rectifying = RectifyingInvoice.builder()
                .id(1L).rectifyingNumber("RECT-001").status(RectifyingInvoiceStatus.DRAFT).build();
        when(invoiceService.createRectifying(eq(1L), any(RectifyingInvoice.class), eq(1L)))
                .thenReturn(rectifying);

        mockMvc.perform(post("/api/invoices/1/rectify")
                        .param("userId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rectifying)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rectifyingNumber").value("RECT-001"));
    }

    @Test
    @DisplayName("DELETE /api/invoices/{id} should return 204")
    void deleteInvoiceShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/invoices/1"))
                .andExpect(status().isNoContent());

        verify(invoiceService).delete(1L);
    }
}
