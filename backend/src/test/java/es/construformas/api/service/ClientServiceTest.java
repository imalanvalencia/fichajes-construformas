package es.construformas.api.service;

import es.construformas.api.model.Client;
import es.construformas.api.repository.ClientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock private ClientRepository clientRepository;
    @InjectMocks private ClientService clientService;

    @Test
    @DisplayName("Create client should save and return it")
    void shouldCreateClient() {
        Client client = Client.builder().name("Test Client").build();
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        Client result = clientService.create(client);

        assertThat(result.getName()).isEqualTo("Test Client");
        verify(clientRepository).save(client);
    }

    @Test
    @DisplayName("Find by ID should return client when exists")
    void shouldFindClientById() {
        Client client = Client.builder().id(1L).name("Test").build();
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        Client result = clientService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test");
    }

    @Test
    @DisplayName("Find by ID should throw when client not found")
    void shouldThrowWhenClientNotFound() {
        when(clientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.findById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Client not found");
    }

    @Test
    @DisplayName("Update client should merge fields and save")
    void shouldUpdateClient() {
        Client existing = Client.builder().id(1L).name("Old").email("old@test.com").active(true).build();
        Client updated = Client.builder().name("New").email("new@test.com").phone("555").address("St 1").city("City").postalCode("12345").notes("note").active(true).build();

        when(clientRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(clientRepository.save(any(Client.class))).thenAnswer(i -> i.getArgument(0));

        Client result = clientService.update(1L, updated);

        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getEmail()).isEqualTo("new@test.com");
        assertThat(result.getPhone()).isEqualTo("555");
        assertThat(result.getAddress()).isEqualTo("St 1");
    }

    @Test
    @DisplayName("Find all should delegate to repository")
    void shouldFindAll() {
        when(clientRepository.findAll()).thenReturn(java.util.List.of(
                Client.builder().id(1L).name("A").build(),
                Client.builder().id(2L).name("B").build()
        ));

        var result = clientService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Delete should delegate to repository")
    void shouldDeleteClient() {
        clientService.delete(1L);
        verify(clientRepository).deleteById(1L);
    }
}
