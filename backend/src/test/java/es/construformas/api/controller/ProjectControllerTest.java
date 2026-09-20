package es.construformas.api.controller;

import es.construformas.api.dto.ProjectFinancialSummaryDTO;
import es.construformas.api.dto.ProjectRequest;
import es.construformas.api.model.Client;
import es.construformas.api.model.Project;
import es.construformas.api.model.ProjectStatus;
import es.construformas.api.service.ProjectService;
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

@WebMvcTest(ProjectController.class)
@DisplayName("ProjectController Tests")
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private Project sampleProject() {
        Client client = Client.builder().id(1L).name("Acme Corp").build();
        return Project.builder()
                .id(1L)
                .name("Office Renovation")
                .description("Full office remodel")
                .address("123 Main St")
                .latitude(40.4168)
                .longitude(-3.7038)
                .status(ProjectStatus.PLANNED)
                .client(client)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("POST /api/projects should create and return project")
    void createProjectShouldReturn201() throws Exception {
        when(projectService.create(any(ProjectRequest.class))).thenReturn(sampleProject());

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleProject())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Office Renovation"));
    }

    @Test
    @DisplayName("GET /api/projects/{id} should return project")
    void getByIdShouldReturnProject() throws Exception {
        when(projectService.findById(1L)).thenReturn(sampleProject());

        mockMvc.perform(get("/api/projects/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Office Renovation"));
    }

    @Test
    @DisplayName("GET /api/projects should return all projects")
    void getAllShouldReturnProjects() throws Exception {
        when(projectService.findAll()).thenReturn(List.of(sampleProject()));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Office Renovation"));
    }

    @Test
    @DisplayName("GET /api/projects/client/{clientId} should return projects by client")
    void getByClientShouldReturnProjects() throws Exception {
        when(projectService.findByClient(1L)).thenReturn(List.of(sampleProject()));

        mockMvc.perform(get("/api/projects/client/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Office Renovation"));
    }

    @Test
    @DisplayName("GET /api/projects/{id}/financial-summary should return summary")
    void getFinancialSummaryShouldReturnDTO() throws Exception {
        ProjectFinancialSummaryDTO summary = ProjectFinancialSummaryDTO.builder()
                .projectId(1L)
                .projectName("Office Renovation")
                .totalBudgeted(new BigDecimal("50000.00"))
                .totalInvoiced(new BigDecimal("25000.00"))
                .totalCollected(new BigDecimal("10000.00"))
                .pendingInvoicing(new BigDecimal("25000.00"))
                .pendingCollection(new BigDecimal("15000.00"))
                .invoicingPercentage(new BigDecimal("50.00"))
                .collectionPercentage(new BigDecimal("40.00"))
                .build();

        when(projectService.getFinancialSummary(1L)).thenReturn(summary);

        mockMvc.perform(get("/api/projects/1/financial-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(1))
                .andExpect(jsonPath("$.projectName").value("Office Renovation"))
                .andExpect(jsonPath("$.totalBudgeted").value(50000.00))
                .andExpect(jsonPath("$.invoicingPercentage").value(50.00));
    }

    @Test
    @DisplayName("PUT /api/projects/{id} should update project")
    void updateProjectShouldReturnUpdated() throws Exception {
        Project updated = Project.builder().name("Updated Project").active(true).build();
        when(projectService.update(eq(1L), any(ProjectRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/projects/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Project"));
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} should return 204")
    void deleteProjectShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/projects/1"))
                .andExpect(status().isNoContent());

        verify(projectService).delete(1L);
    }
}
