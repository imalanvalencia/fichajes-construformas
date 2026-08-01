package es.construformas.api.service;

import es.construformas.api.repository.RefreshTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenCleanupServiceTest {

    @Mock private RefreshTokenRepository refreshTokenRepository;
    @InjectMocks private RefreshTokenCleanupService refreshTokenCleanupService;

    @Test
    @DisplayName("Cleanup should call deleteExpiredOrRevoked with current time")
    void shouldCallDeleteExpiredOrRevoked() {
        when(refreshTokenRepository.deleteExpiredOrRevoked(any(LocalDateTime.class))).thenReturn(5);

        refreshTokenCleanupService.cleanupExpiredTokens();

        verify(refreshTokenRepository).deleteExpiredOrRevoked(any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Cleanup should handle zero deletions gracefully")
    void shouldHandleZeroDeletions() {
        when(refreshTokenRepository.deleteExpiredOrRevoked(any(LocalDateTime.class))).thenReturn(0);

        refreshTokenCleanupService.cleanupExpiredTokens();

        verify(refreshTokenRepository).deleteExpiredOrRevoked(any(LocalDateTime.class));
    }
}
