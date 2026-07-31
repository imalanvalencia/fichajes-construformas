package es.construformas.api.service;

import es.construformas.api.dto.ProjectFinancialSummaryDTO;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final BudgetRepository budgetRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ClientRepository clientRepository;

    public Project create(Project project) {
        if (project.getClient() == null || project.getClient().getId() == null) {
            throw new IllegalArgumentException("Client is required");
        }
        Client client = clientRepository.findById(project.getClient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        project.setClient(client);
        if (project.getStatus() == null) project.setStatus(ProjectStatus.PLANNED);
        return projectRepository.save(project);
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public List<Project> findByClient(Long clientId) {
        return projectRepository.findByClientId(clientId);
    }

    public List<Project> findByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    public Project update(Long id, Project updated) {
        Project existing = findById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        if (updated.getLatitude() != null) existing.setLatitude(updated.getLatitude());
        if (updated.getLongitude() != null) existing.setLongitude(updated.getLongitude());
        if (updated.getAllowedRadiusMeters() != null) existing.setAllowedRadiusMeters(updated.getAllowedRadiusMeters());
        if (updated.getStartDate() != null) existing.setStartDate(updated.getStartDate());
        if (updated.getEstimatedEndDate() != null) existing.setEstimatedEndDate(updated.getEstimatedEndDate());
        if (updated.getActualEndDate() != null) existing.setActualEndDate(updated.getActualEndDate());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        existing.setActive(updated.isActive());
        return projectRepository.save(existing);
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    public ProjectFinancialSummaryDTO getFinancialSummary(Long projectId) {
        Project project = findById(projectId);

        BigDecimal totalBudgeted = budgetRepository
                .findByProjectIdAndStatus(projectId, BudgetStatus.APPROVED)
                .stream()
                .map(Budget::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalInvoiced = invoiceRepository.sumInvoicedByProject(projectId);
        BigDecimal totalCollected = paymentRepository.sumPaymentsByProject(projectId);

        BigDecimal pendingInvoicing = totalBudgeted.subtract(totalInvoiced);
        BigDecimal pendingCollection = totalInvoiced.subtract(totalCollected);

        BigDecimal invoicingPercentage = totalBudgeted.compareTo(BigDecimal.ZERO) > 0
                ? totalInvoiced.multiply(BigDecimal.valueOf(100)).divide(totalBudgeted, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal collectionPercentage = totalInvoiced.compareTo(BigDecimal.ZERO) > 0
                ? totalCollected.multiply(BigDecimal.valueOf(100)).divide(totalInvoiced, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return ProjectFinancialSummaryDTO.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .totalBudgeted(totalBudgeted)
                .totalInvoiced(totalInvoiced)
                .totalCollected(totalCollected)
                .pendingInvoicing(pendingInvoicing)
                .pendingCollection(pendingCollection)
                .invoicingPercentage(invoicingPercentage)
                .collectionPercentage(collectionPercentage)
                .build();
    }
}
