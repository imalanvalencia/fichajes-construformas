package es.construformas.api.model;

/**
 * @deprecated Replaced by {@link Role} entity (many-to-many RBAC). 
 * Kept as dead code for MANAGER — will be removed when services are updated.
 */
@Deprecated
public enum UserRole {
    ADMIN,
    OPERATOR,
    @Deprecated
    MANAGER
}
