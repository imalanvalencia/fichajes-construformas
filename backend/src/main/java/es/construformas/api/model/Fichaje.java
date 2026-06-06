package es.construformas.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fichajes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fichaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoFichaje tipoFichaje;

    @Column(nullable = false)
    private Double latitudUsuario;

    @Column(nullable = false)
    private Double longitudUsuario;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime fechaHora = LocalDateTime.now();

    private String observaciones;
}
