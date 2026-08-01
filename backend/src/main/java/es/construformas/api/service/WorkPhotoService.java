package es.construformas.api.service;

import es.construformas.api.model.Project;
import es.construformas.api.model.User;
import es.construformas.api.model.WorkPhoto;
import es.construformas.api.repository.ProjectRepository;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.repository.WorkPhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkPhotoService {

    private final WorkPhotoRepository workPhotoRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public WorkPhoto create(WorkPhoto photo) {
        Project project = projectRepository.findById(photo.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User uploader = userRepository.findById(photo.getUploadedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        photo.setProject(project);
        photo.setUploadedBy(uploader);
        return workPhotoRepository.save(photo);
    }

    public List<WorkPhoto> findByProject(Long projectId) {
        return workPhotoRepository.findByProjectId(projectId);
    }

    public void delete(Long id) {
        workPhotoRepository.deleteById(id);
    }
}
