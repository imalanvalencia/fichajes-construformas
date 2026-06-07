package es.construformas.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String SECRET = "construformas-secret-key-that-is-long-enough-for-hs256-algorithm";
    private static final long EXPIRATION = 86400000; // 24h

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION);
    }

    @Test
    @DisplayName("Generate token and extract email")
    void generateToken_shouldExtractEmail() {
        String token = jwtUtil.generateToken("test@construformas.com", "ADMIN");

        assertEquals("test@construformas.com", jwtUtil.extractEmail(token));
    }

    @Test
    @DisplayName("Generate token and extract role")
    void generateToken_shouldExtractRole() {
        String token = jwtUtil.generateToken("test@construformas.com", "OPERATOR");

        assertEquals("OPERATOR", jwtUtil.extractRole(token));
    }

    @Test
    @DisplayName("Valid token should validate")
    void validateToken_validToken_shouldReturnTrue() {
        String token = jwtUtil.generateToken("test@construformas.com", "ADMIN");

        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    @DisplayName("Expired token should not validate")
    void validateToken_expiredToken_shouldReturnFalse() {
        JwtUtil shortLived = new JwtUtil(SECRET, -1); // already expired
        String token = shortLived.generateToken("test@construformas.com", "ADMIN");

        assertFalse(jwtUtil.validateToken(token));
    }

    @Test
    @DisplayName("Garbage token should not validate")
    void validateToken_garbageToken_shouldReturnFalse() {
        assertFalse(jwtUtil.validateToken("not.a.valid.token"));
    }
}
