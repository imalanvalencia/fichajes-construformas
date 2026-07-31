package es.construformas.api.controller;

import es.construformas.api.dto.AuthResponse;
import es.construformas.api.dto.LoginRequest;
import es.construformas.api.dto.RegisterRequest;
import es.construformas.api.service.AuthService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = JsonMapper.builder().addModule(new JavaTimeModule()).build();

    @Test
    @DisplayName("POST /api/auth/login should return token")
    void loginShouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest("test@test.com", "password123");
        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("test@test.com")
                .role("OPERATOR")
                .name("Test User")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.role").value("OPERATOR"));
    }

    @Test
    @DisplayName("POST /api/auth/register should return 201 with token")
    void registerShouldReturnCreated() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("new@test.com");
        request.setPassword("password123");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("new@test.com")
                .role("OPERATOR")
                .name("New User")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("new@test.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login with invalid email should return 400")
    void loginWithInvalidEmailShouldReturnBadRequest() throws Exception {
        LoginRequest request = new LoginRequest("invalid-email", "password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login with blank password should return 400")
    void loginWithBlankPasswordShouldReturnBadRequest() throws Exception {
        LoginRequest request = new LoginRequest("test@test.com", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register with short password should return 400")
    void registerWithShortPasswordShouldReturnBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test");
        request.setEmail("test@test.com");
        request.setPassword("123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
