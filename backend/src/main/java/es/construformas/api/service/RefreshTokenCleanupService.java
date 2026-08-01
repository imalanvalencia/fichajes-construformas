package es.construformas.api.service;

import es.construformas.api.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(fixedRate = 7 * 24 * 60 * 60 * 1000)
    public void cleanupExpiredTokens() {
        int deleted = refreshTokenRepository.deleteExpiredOrRevoked(LocalDateTime.now());
        log.info("Refresh token cleanup: {} tokens deleted", deleted);
    }
}
