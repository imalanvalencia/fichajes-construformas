package es.construformas.api.service;

import es.construformas.api.model.Client;
import es.construformas.api.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;

    public Client create(Client client) {
        return clientRepository.save(client);
    }

    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
    }

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public List<Client> search(String name) {
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
