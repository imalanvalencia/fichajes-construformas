package es.construformas.api.repository;

import es.construformas.api.model.WorkPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkPhotoRepository extends JpaRepository<WorkPhoto, Long> {
    List<WorkPhoto> findByProjectId(Long projectId);
    List<WorkPhoto> findByUploadedByIdOrderByPhotoDateDesc(Long userId);
    List<WorkPhoto> findByProjectIdAndPhaseId(Long projectId, Long phaseId);
    List<WorkPhoto> findByPhotoDateBetween(LocalDate start, LocalDate end);
}
