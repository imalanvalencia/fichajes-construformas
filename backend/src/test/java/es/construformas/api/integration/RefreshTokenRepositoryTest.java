package es.construformas.api.integration;

import es.construformas.api.model.RefreshToken;
import es.construformas.api.model.User;
import es.construformas.api.model.UserRole;
import es.construformas.api.repository.RefreshTokenRepository;
import es.construformas.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RefreshTokenRepositoryTest {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
        testUser = userRepository.save(User.builder()
            .name("Test User").email("test@test.com")
            .password("hashed").role(UserRole.OPERATOR).build());
    }

    @Test
    void shouldSaveAndFindByToken() {
        RefreshToken token = refreshTokenRepository.save(RefreshToken.builder()
            .id(UUID.randomUUID().toString())
            .user(testUser)
            .token("test-jwt-token")
            .expiry(LocalDateTime.now().plusDays(14))
            .build());

        Optional<RefreshToken> found = refreshTokenRepository.findByToken("test-jwt-token");
        assertTrue(found.isPresent());
        assertEquals(token.getId(), found.get().getId());
    }

    @Test
    void shouldFindActiveTokensByUserId() {
        refreshTokenRepository.save(RefreshToken.builder()
            .id(UUID.randomUUID().toString())
            .user(testUser).token("token1")
            .expiry(LocalDateTime.now().plusDays(14)).build());
        refreshTokenRepository.save(RefreshToken.builder()
            .id(UUID.randomUUID().toString())
            .user(testUser).token("token2")
            .expiry(LocalDateTime.now().plusDays(14)).revoked(true).build());

        List<RefreshToken> active = refreshTokenRepository.findByUserIdAndRevokedFalse(testUser.getId());
        assertEquals(1, active.size());
        assertEquals("token1", active.get(0).getToken());
    }

    @Test
    void shouldDeleteExpiredOrRevokedTokens() {
        refreshTokenRepository.save(RefreshToken.builder()
            .id(UUID.randomUUID().toString())
            .user(testUser).token("expired")
            .expiry(LocalDateTime.now().minusDays(1)).build());
        refreshTokenRepository.save(RefreshToken.builder()
            .id(UUID.randomUUID().toString())
            .user(testUser).token("revoked")
            .expiry(LocalDateTime.now().plusDays(14)).revoked(true).build());
        refreshTokenRepository.save(RefreshToken.builder()
            .id(UUID.randomUUID().toString())
            .user(testUser).token("valid")
            .expiry(LocalDateTime.now().plusDays(14)).build());

        int deleted = refreshTokenRepository.deleteExpiredOrRevoked(LocalDateTime.now());
        assertEquals(2, deleted);
        assertEquals(1, refreshTokenRepository.count());
    }
}
