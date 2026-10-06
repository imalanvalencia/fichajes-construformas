package es.construformas.api.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:healthdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.open-in-view=false",
        "spring.flyway.enabled=false",
        "spring.sql.init.mode=never",
        "springdoc.api-docs.enabled=false",
        "springdoc.swagger-ui.enabled=false"
})
@AutoConfigureMockMvc
@DisplayName("Health endpoint (Actuator) Tests")
class HealthEndpointTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /health should list every checked component without authentication")
    void getHealthShouldListComponentsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components.db.status").value("UP"))
                .andExpect(jsonPath("$.components.diskSpace.status").value("UP"))
                .andExpect(jsonPath("$.components.ping.status").value("UP"));
    }

    @Test
    @DisplayName("GET /health should not leak infrastructure details without a token")
    void getHealthShouldHideDetailsWithoutToken() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.diskSpace.details").doesNotExist());
    }

    @Test
    @DisplayName("GET /health/liveness should return 200 with status UP")
    void livenessProbeShouldReturnUp() throws Exception {
        mockMvc.perform(get("/health/liveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("GET /health/readiness should return 200 with status UP")
    void readinessProbeShouldReturnUp() throws Exception {
        mockMvc.perform(get("/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("GET /health/internal should require a token")
    void healthInternalShouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/health/internal"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /health/internal should expose details to an authenticated caller")
    void healthInternalShouldExposeDetailsWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/health/internal")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components.db.status").value("UP"))
                .andExpect(jsonPath("$.components.diskSpace.details.total").exists())
                .andExpect(jsonPath("$.components.diskSpace.details.free").exists());
    }

    @Test
    @DisplayName("GET /metrics should require a token")
    void metricsShouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /metrics should serve latency and pool metrics to an authenticated caller")
    void metricsShouldServeLatencyWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/metrics")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.names").isArray())
                .andExpect(jsonPath("$.names[?(@ == 'http.server.requests.active')]").exists())
                .andExpect(jsonPath("$.names[?(@ == 'hikaricp.connections.active')]").exists());
    }

    @Test
    @DisplayName("Protected API should still deny anonymous access")
    void protectedApiShouldStillDenyAnonymousAccess() throws Exception {
        mockMvc.perform(get("/api/clients"))
                .andExpect(status().isForbidden());
    }
}
