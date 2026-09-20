package es.construformas.api.service;

import es.construformas.api.dto.ProjectFinancialSummaryDTO;
import es.construformas.api.dto.ProjectRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private ClientRepository clientRepository;
    @InjectMocks private ProjectService projectService;

    @Test
    @DisplayName("Create project should set status PLANNED and save")
    void shouldCreateProject() {
        Client client = Client.builder().id(1L).name("Client").build();
        ProjectRequest request = new ProjectRequest();
        request.setClientId(1L);
        request.setName("Test Project");
        request.setAddress("Calle 1");
        request.setLatitude(40.0);
        request.setLongitude(-3.0);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(projectRepository.save(any(Project.class))).thenAnswer(i -> {
            Project p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        Project result = projectService.create(request);

        assertThat(result.getName()).isEqualTo("Test Project");
        assertThat(result.getStatus()).isEqualTo(ProjectStatus.PLANNED);
        assertThat(result.getClient()).isEqualTo(client);
    }

    @Test
    @DisplayName("Create project without client should throw")
    void shouldRejectProjectWithoutClient() {
        ProjectRequest request = new ProjectRequest();
        request.setName("No Client");
        request.setAddress("Calle 1");
        request.setLatitude(40.0);
        request.setLongitude(-3.0);
        // no clientId set

        assertThatThrownBy(() -> projectService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Client is required");
    }

    @Test
    @DisplayName("Find by ID should return project when exists")
    void shouldFindProjectById() {
        Project project = Project.builder().id(1L).name("Project").build();
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        Project result = projectService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Project");
    }

    @Test
    @DisplayName("Find by ID should throw when not found")
    void shouldThrowWhenProjectNotFound() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.findById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Project not found");
    }

    @Test
    @DisplayName("Financial summary should compute correct amounts")
    void shouldCalculateFinancialSummary() {
        Project project = Project.builder().id(1L).name("Project").build();
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(budgetRepository.findByProjectIdAndStatus(1L, BudgetStatus.APPROVED))
                .thenReturn(List.of(
                        Budget.builder().finalAmount(new BigDecimal("50000")).build()
                ));
        when(invoiceRepository.sumInvoicedByProject(1L)).thenReturn(new BigDecimal("30000"));
        when(paymentRepository.sumPaymentsByProject(1L)).thenReturn(new BigDecimal("20000"));

        ProjectFinancialSummaryDTO summary = projectService.getFinancialSummary(1L);

        assertThat(summary.getTotalBudgeted()).isEqualByComparingTo("50000");
        assertThat(summary.getTotalInvoiced()).isEqualByComparingTo("30000");
        assertThat(summary.getTotalCollected()).isEqualByComparingTo("20000");
        assertThat(summary.getPendingInvoicing()).isEqualByComparingTo("20000");
        assertThat(summary.getPendingCollection()).isEqualByComparingTo("10000");
        assertThat(summary.getInvoicingPercentage()).isEqualByComparingTo("60.00");
        assertThat(summary.getCollectionPercentage()).isEqualByComparingTo("66.67");
    }

    @Test
    @DisplayName("Financial summary with no budgets should return zeros")
    void shouldReturnZeroWhenNoBudgets() {
        Project project = Project.builder().id(1L).name("Project").build();
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(budgetRepository.findByProjectIdAndStatus(1L, BudgetStatus.APPROVED)).thenReturn(List.of());
        when(invoiceRepository.sumInvoicedByProject(1L)).thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumPaymentsByProject(1L)).thenReturn(BigDecimal.ZERO);

        ProjectFinancialSummaryDTO summary = projectService.getFinancialSummary(1L);

        assertThat(summary.getTotalBudgeted()).isEqualByComparingTo("0");
        assertThat(summary.getTotalInvoiced()).isEqualByComparingTo("0");
        assertThat(summary.getInvoicingPercentage()).isEqualByComparingTo("0");
        assertThat(summary.getCollectionPercentage()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("Delete should delegate to repository")
    void shouldDeleteProject() {
        projectService.delete(1L);
        verify(projectRepository).deleteById(1L);
    }
}
