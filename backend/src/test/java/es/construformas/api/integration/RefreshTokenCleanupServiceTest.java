package es.construformas.api.integration;

import es.construformas.api.model.RefreshToken;
import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import es.construformas.api.repository.RefreshTokenRepository;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.service.RefreshTokenCleanupService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Integration test for the scheduled cleanup.
 *
 * Deliberately NOT annotated with {@code @Transactional}: the production entry point
 * is a {@code @Scheduled} method, which runs without any caller-provided transaction.
 * If the test opened its own transaction it would mask a missing {@code @Transactional}
 * on the service, which is exactly how this bug stayed hidden.
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("RefreshTokenCleanupService (integration) Tests")
class RefreshTokenCleanupServiceTest {

    @Autowired
    private RefreshTokenCleanupService refreshTokenCleanupService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.findByEmail("cleanup@test.com").ifPresent(userRepository::delete);
        testUser = userRepository.save(User.builder()
                .name("Cleanup User")
                .email("cleanup@test.com")
                .password("hashed")
                .role(UserRole.OPERATOR)
                .build());
    }

    @AfterEach
    void tearDown() {
        refreshTokenRepository.deleteAll();
        userRepository.findByEmail("cleanup@test.com").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Cleanup should delete expired and revoked tokens and keep valid ones")
    void cleanupShouldDeleteExpiredAndRevokedAndKeepValidTokens() {
        saveToken("expired", LocalDateTime.now().minusDays(1), false);
        saveToken("revoked", LocalDateTime.now().plusDays(14), true);
        saveToken("valid", LocalDateTime.now().plusDays(14), false);
        assertEquals(3, refreshTokenRepository.count());

        refreshTokenCleanupService.cleanupExpiredTokens();

        assertEquals(1, refreshTokenRepository.count());
        assertTrue(refreshTokenRepository.findByToken("valid").isPresent(),
                "The valid token must survive the cleanup");
    }

    @Test
    @DisplayName("Cleanup should be a no-op when there is nothing to delete")
    void cleanupShouldKeepAllTokensWhenNoneAreExpiredOrRevoked() {
        saveToken("valid", LocalDateTime.now().plusDays(14), false);

        refreshTokenCleanupService.cleanupExpiredTokens();

        assertEquals(1, refreshTokenRepository.count());
    }

    private void saveToken(String token, LocalDateTime expiry, boolean revoked) {
        refreshTokenRepository.save(RefreshToken.builder()
                .id(UUID.randomUUID().toString())
                .user(testUser)
                .token(token)
                .expiry(expiry)
                .revoked(revoked)
                .build());
    }
}
