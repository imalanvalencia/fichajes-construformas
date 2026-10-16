package es.construformas.api.security;

import es.construformas.api.model.User;
import es.construformas.api.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user");
        }
        return auth.getName();
    }

    public static User getCurrentUser(UserRepository userRepository) {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));
    }

    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    /**
     * Decides whose record a clock-in/correction request is for. Omitting the id means
     * the authenticated caller; naming another id is allowed for ADMIN only, so an
     * OPERATOR can never write a record on behalf of someone else.
     */
    public static User resolveTargetUser(UserRepository userRepository, User caller, Long requestedUserId) {
        if (requestedUserId == null || requestedUserId.equals(caller.getId())) {
            return caller;
        }
        if (caller.getRoles().stream().noneMatch(r -> "ADMIN".equals(r.getName()))) {
            throw new AccessDeniedException("Operators may only clock in for themselves");
        }
        return userRepository.findById(requestedUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
