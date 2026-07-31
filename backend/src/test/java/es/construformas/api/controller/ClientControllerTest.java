package es.construformas.api.controller;

import es.construformas.api.model.Client;
import es.construformas.api.service.ClientService;
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

@WebMvcTest(ClientController.class)
@DisplayName("ClientController Tests")
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClientService clientService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private Client sampleClient() {
        return Client.builder()
                .id(1L)
                .name("Acme Corp")
                .email("acme@test.com")
                .phone("555-0000")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("POST /api/clients should create and return client")
    void createClientShouldReturn201() throws Exception {
        when(clientService.create(any(Client.class))).thenReturn(sampleClient());

        mockMvc.perform(post("/api/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleClient())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    @DisplayName("GET /api/clients/{id} should return client")
    void getByIdShouldReturnClient() throws Exception {
        when(clientService.findById(1L)).thenReturn(sampleClient());

        mockMvc.perform(get("/api/clients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Corp"));
    }

    @Test
    @DisplayName("GET /api/clients should return all clients")
    void getAllShouldReturnClients() throws Exception {
        when(clientService.findAll()).thenReturn(List.of(sampleClient()));

        mockMvc.perform(get("/api/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Acme Corp"));
    }

    @Test
    @DisplayName("GET /api/clients/search?name= should return matching clients")
    void searchShouldReturnMatchingClients() throws Exception {
        when(clientService.search("Acme")).thenReturn(List.of(sampleClient()));

        mockMvc.perform(get("/api/clients/search").param("name", "Acme"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Acme Corp"));
    }

    @Test
    @DisplayName("PUT /api/clients/{id} should update client")
    void updateClientShouldReturnUpdated() throws Exception {
        Client updated = Client.builder().name("Acme Updated").active(true).build();
        when(clientService.update(eq(1L), any(Client.class))).thenReturn(updated);

        mockMvc.perform(put("/api/clients/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Updated"));
    }

    @Test
    @DisplayName("DELETE /api/clients/{id} should return 204")
    void deleteClientShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/clients/1"))
                .andExpect(status().isNoContent());

        verify(clientService).delete(1L);
    }
}
