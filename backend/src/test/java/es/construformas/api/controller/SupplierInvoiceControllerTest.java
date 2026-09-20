package es.construformas.api.controller;

import es.construformas.api.dto.SupplierInvoiceRequest;
import es.construformas.api.model.Supplier;
import es.construformas.api.model.SupplierInvoice;
import es.construformas.api.model.SupplierInvoiceStatus;
import es.construformas.api.model.User;
import es.construformas.api.service.SupplierInvoiceService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SupplierInvoiceController.class)
@DisplayName("SupplierInvoiceController Tests")
class SupplierInvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SupplierInvoiceService supplierInvoiceService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private SupplierInvoice sampleSupplierInvoice() {
        Supplier supplier = Supplier.builder().id(1L).name("BuildSupply Co").build();
        User creator = User.builder().id(1L).name("Admin").build();
        return SupplierInvoice.builder()
                .id(1L)
                .supplier(supplier)
                .invoiceNumber("SI-001")
                .invoiceDate(LocalDate.now())
                .subtotal(new BigDecimal("3000.00"))
                .taxRate(new BigDecimal("21.00"))
                .taxAmount(new BigDecimal("630.00"))
                .total(new BigDecimal("3630.00"))
                .status(SupplierInvoiceStatus.RECEIVED)
                .createdBy(creator)
                .build();
    }

    @Test
    @DisplayName("POST /api/supplier-invoices should create and return supplier invoice")
    void createShouldReturn201() throws Exception {
        when(supplierInvoiceService.create(any(SupplierInvoiceRequest.class))).thenReturn(sampleSupplierInvoice());

        String requestJson = objectMapper.writeValueAsString(
            new java.util.LinkedHashMap<>() {{
                put("supplierId", 1L);
                put("createdById", 1L);
                put("invoiceNumber", "SI-001");
                put("invoiceDate", LocalDate.now().toString());
                put("subtotal", "3000.00");
                put("taxRate", "21.00");
                put("taxAmount", "630.00");
                put("total", "3630.00");
                put("status", "RECEIVED");
            }});

        mockMvc.perform(post("/api/supplier-invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.invoiceNumber").value("SI-001"));
    }

    @Test
    @DisplayName("GET /api/supplier-invoices/{id} should return supplier invoice")
    void getByIdShouldReturnSupplierInvoice() throws Exception {
        when(supplierInvoiceService.findById(1L)).thenReturn(sampleSupplierInvoice());

        mockMvc.perform(get("/api/supplier-invoices/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNumber").value("SI-001"));
    }

    @Test
    @DisplayName("GET /api/supplier-invoices/supplier/{supplierId} should return list")
    void getBySupplierShouldReturnList() throws Exception {
        when(supplierInvoiceService.findBySupplier(1L)).thenReturn(List.of(sampleSupplierInvoice()));

        mockMvc.perform(get("/api/supplier-invoices/supplier/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].invoiceNumber").value("SI-001"));
    }

    @Test
    @DisplayName("GET /api/supplier-invoices/project/{projectId} should return list")
    void getByProjectShouldReturnList() throws Exception {
        when(supplierInvoiceService.findByProject(1L)).thenReturn(List.of(sampleSupplierInvoice()));

        mockMvc.perform(get("/api/supplier-invoices/project/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].invoiceNumber").value("SI-001"));
    }

    @Test
    @DisplayName("PUT /api/supplier-invoices/{id}/status should update status")
    void updateStatusShouldReturnUpdated() throws Exception {
        SupplierInvoice updated = sampleSupplierInvoice();
        updated.setStatus(SupplierInvoiceStatus.APPROVED);
        when(supplierInvoiceService.updateStatus(1L, SupplierInvoiceStatus.APPROVED)).thenReturn(updated);

        mockMvc.perform(put("/api/supplier-invoices/1/status")
                        .param("status", "APPROVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
