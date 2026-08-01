package es.construformas.api.repository;

import es.construformas.api.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserIdAndRevokedFalse(Long userId);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiry < :now OR r.revoked = true")
    int deleteExpiredOrRevoked(@Param("now") LocalDateTime now);
}
