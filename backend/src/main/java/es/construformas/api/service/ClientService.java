package es.construformas.api.service;

import es.construformas.api.model.Client;
import es.construformas.api.model.Project;
import es.construformas.api.model.User;
import es.construformas.api.repository.ClientRepository;
import es.construformas.api.repository.ProjectRepository;
import es.construformas.api.repository.UserRepository;
import es.construformas.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Client create(Client client) {
        return clientRepository.save(client);
    }

    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
    }

    public List<Client> findAll() {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            return operatorProjects.stream()
                    .map(Project::getClient)
                    .filter(client -> client != null)
                    .distinct()
                    .toList();
        }
        return clientRepository.findAll();
    }

    public List<Client> search(String name) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            List<Long> clientIds = operatorProjects.stream()
                    .map(Project::getClient)
                    .filter(client -> client != null)
                    .map(Client::getId)
                    .distinct()
                    .toList();
            return clientRepository.findByIdInAndNameContainingIgnoreCase(clientIds, name);
        }
        return clientRepository.findByNameContainingIgnoreCase(name);
    }

    public Client update(Long id, Client updated) {
        Client existing = findById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setPostalCode(updated.getPostalCode());
        existing.setNotes(updated.getNotes());
        existing.setActive(updated.isActive());
        return clientRepository.save(existing);
    }

    public void delete(Long id) {
        clientRepository.deleteById(id);
    }
}
