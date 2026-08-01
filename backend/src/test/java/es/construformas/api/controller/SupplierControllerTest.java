package es.construformas.api.controller;

import es.construformas.api.model.Supplier;
import es.construformas.api.service.SupplierService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SupplierController.class)
@DisplayName("SupplierController Tests")
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SupplierService supplierService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private Supplier sampleSupplier() {
        return Supplier.builder()
                .id(1L)
                .name("BuildSupply Co")
                .contactName("Jane Smith")
                .email("supply@test.com")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("POST /api/suppliers should create and return supplier")
    void createSupplierShouldReturn201() throws Exception {
        when(supplierService.create(any(Supplier.class))).thenReturn(sampleSupplier());

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleSupplier())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("BuildSupply Co"));
    }

    @Test
    @DisplayName("GET /api/suppliers/{id} should return supplier")
    void getByIdShouldReturnSupplier() throws Exception {
        when(supplierService.findById(1L)).thenReturn(sampleSupplier());

        mockMvc.perform(get("/api/suppliers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("BuildSupply Co"));
    }

    @Test
    @DisplayName("GET /api/suppliers should return all suppliers")
    void getAllShouldReturnSuppliers() throws Exception {
        when(supplierService.findAll()).thenReturn(List.of(sampleSupplier()));

        mockMvc.perform(get("/api/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("BuildSupply Co"));
    }

    @Test
    @DisplayName("GET /api/suppliers/search?name= should return matching suppliers")
    void searchShouldReturnMatchingSuppliers() throws Exception {
        when(supplierService.search("Build")).thenReturn(List.of(sampleSupplier()));

        mockMvc.perform(get("/api/suppliers/search").param("name", "Build"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("BuildSupply Co"));
    }

    @Test
    @DisplayName("PUT /api/suppliers/{id} should update supplier")
    void updateSupplierShouldReturnUpdated() throws Exception {
        Supplier updated = Supplier.builder().name("BuildSupply Updated").active(true).build();
        when(supplierService.update(eq(1L), any(Supplier.class))).thenReturn(updated);

        mockMvc.perform(put("/api/suppliers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("BuildSupply Updated"));
    }

    @Test
    @DisplayName("DELETE /api/suppliers/{id} should return 204")
    void deleteSupplierShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/suppliers/1"))
                .andExpect(status().isNoContent());

        verify(supplierService).delete(1L);
    }
}
