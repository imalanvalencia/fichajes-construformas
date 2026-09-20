package es.construformas.api.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProjectIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder()
        .addModule(new JavaTimeModule()).build();

    @Test
    void shouldCreateProjectWithClient() throws Exception {
        User user = userRepository.save(User.builder()
            .name("Admin").email("admin@test.com")
            .password("hashed").role(UserRole.ADMIN).build());
        Client client = clientRepository.save(Client.builder().name("Client").build());

        String projectJson = objectMapper.writeValueAsString(
            new java.util.LinkedHashMap<>() {{
                put("clientId", client.getId());
                put("name", "New Project");
                put("address", "Calle 1");
                put("latitude", 40.0);
                put("longitude", -3.0);
                put("status", "PLANNED");
            }});

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON).content(projectJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("New Project"))
            .andExpect(jsonPath("$.status").value("PLANNED"));
    }

    @Test
    void shouldReturn400ForNonExistentProject() throws Exception {
        mockMvc.perform(get("/api/projects/999"))
            .andExpect(status().isBadRequest());
    }
}
