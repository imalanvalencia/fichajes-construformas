package es.construformas.api.controller;

import es.construformas.api.model.*;
import es.construformas.api.service.ClockCorrectionService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClockCorrectionController.class)
@DisplayName("ClockCorrectionController Tests")
class ClockCorrectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClockCorrectionService clockCorrectionService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    private ClockCorrection sampleCorrection() {
        User user = User.builder().id(1L).name("Worker").build();
        Project project = Project.builder().id(1L).name("Site A").build();
        return ClockCorrection.builder()
                .id(1L)
                .user(user)
                .project(project)
                .correctionDate(LocalDate.of(2026, 1, 15))
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.of(2026, 1, 15, 7, 45))
                .reason("Forgot to clock in")
                .status(CorrectionStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("POST /api/clock-corrections should accept the flat contract")
    void requestCorrectionShouldReturn201WithFlatContract() throws Exception {
        when(clockCorrectionService.requestCorrection(any(ClockCorrection.class)))
                .thenReturn(sampleCorrection());

        mockMvc.perform(post("/api/clock-corrections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 1,
                                  "projectId": 1,
                                  "correctionDate": "2026-01-15",
                                  "originalClockType": "ENTRY",
                                  "correctedTime": "2026-01-15T07:45:00",
                                  "reason": "Forgot to clock in"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.userName").value("Worker"))
                .andExpect(jsonPath("$.projectId").value(1))
                .andExpect(jsonPath("$.projectName").value("Site A"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.user").doesNotExist())
                .andExpect(jsonPath("$.project").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/clock-corrections/pending should return pending corrections")
    void getPendingShouldReturnList() throws Exception {
        when(clockCorrectionService.findPending()).thenReturn(List.of(sampleCorrection()));

        mockMvc.perform(get("/api/clock-corrections/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].userName").value("Worker"))
                .andExpect(jsonPath("$[0].projectName").value("Site A"))
                .andExpect(jsonPath("$[0].user").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/clock-corrections/user/{userId} should return user corrections")
    void getByUserShouldReturnList() throws Exception {
        when(clockCorrectionService.findByUser(1L)).thenReturn(List.of(sampleCorrection()));

        mockMvc.perform(get("/api/clock-corrections/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].reason").value("Forgot to clock in"));
    }

    @Test
    @DisplayName("PUT /api/clock-corrections/{id}/approve should approve as the authenticated reviewer")
    void approveShouldReturnApproved() throws Exception {
        ClockCorrection approved = sampleCorrection();
        approved.setStatus(CorrectionStatus.APPROVED);
        when(clockCorrectionService.approve(1L)).thenReturn(approved);

        mockMvc.perform(put("/api/clock-corrections/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @DisplayName("PUT /api/clock-corrections/{id}/reject should reject as the authenticated reviewer")
    void rejectShouldReturnRejected() throws Exception {
        ClockCorrection rejected = sampleCorrection();
        rejected.setStatus(CorrectionStatus.REJECTED);
        when(clockCorrectionService.reject(1L)).thenReturn(rejected);

        mockMvc.perform(put("/api/clock-corrections/1/reject"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }
}
