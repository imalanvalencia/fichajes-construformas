-- V3: Create fichajes (clock-in events) table with FK constraints
CREATE TABLE fichajes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    obra_id BIGINT NOT NULL,
    tipo_fichaje VARCHAR(20) NOT NULL,
    latitud_usuario DOUBLE NOT NULL,
    longitud_usuario DOUBLE NOT NULL,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(500),
    CONSTRAINT fk_fichajes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_fichajes_obra FOREIGN KEY (obra_id) REFERENCES obras(id)
);
