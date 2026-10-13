package es.construformas.api.exception;

/**
 * Thrown when a requested user does not exist. Mapped to HTTP 404 by
 * {@link GlobalExceptionHandler}, so callers get a real not-found instead of
 * the 400 produced by a generic {@link IllegalArgumentException}.
 */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("User not found: " + id);
    }
}
