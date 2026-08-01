package es.construformas.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private List<String> roles;
    private String name;

    /** @deprecated Use {@link #AuthResponse(String, String, String, List, String)} instead. */
    @Deprecated
    public AuthResponse(String token, String email, String role, String name) {
        this.accessToken = token;
        this.email = email;
        this.roles = role != null ? List.of(role) : List.of();
        this.name = name;
    }
}
