package es.construformas.api.service;

import es.construformas.api.dto.ProjectFinancialSummaryDTO;
import es.construformas.api.dto.ProjectRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import es.construformas.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
    private final UserRepository userRepository;

    public Project create(ProjectRequest request) {
        if (request.getClientId() == null) {
            throw new IllegalArgumentException("Client is required");
        }
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        ProjectStatus status = request.getStatus() != null
                ? ProjectStatus.valueOf(request.getStatus())
                : ProjectStatus.PLANNED;

        Project project = Project.builder()
                .client(client)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .allowedRadiusMeters(request.getAllowedRadiusMeters() != null ? request.getAllowedRadiusMeters() : 50)
                .startDate(parseDate(request.getStartDate()))
                .estimatedEndDate(parseDate(request.getEstimatedEndDate()))
                .actualEndDate(parseDate(request.getActualEndDate()))
                .status(status)
                .active(request.isActive())
                .build();

        return projectRepository.save(project);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateStr + ". Expected yyyy-MM-dd");
        }
    }

    public Project findById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!project.getOperators().contains(user)) {
                throw new IllegalArgumentException("Access denied: not assigned to this project");
            }
        }
        return project;
    }

    public List<Project> findAll() {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            return projectRepository.findByOperatorId(user.getId());
        }
        return projectRepository.findAll();
    }

    public List<Project> findByClient(Long clientId) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            return operatorProjects.stream()
                    .filter(p -> p.getClient() != null && p.getClient().getId().equals(clientId))
                    .toList();
        }
        return projectRepository.findByClientId(clientId);
    }

    public List<Project> findByStatus(ProjectStatus status) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            return operatorProjects.stream()
                    .filter(p -> p.getStatus() == status)
                    .toList();
        }
        return projectRepository.findByStatus(status);
    }

    public Project update(Long id, ProjectRequest request) {
        Project existing = findById(id);

        if (request.getClientId() != null) {
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found"));
            existing.setClient(client);
        }

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setAddress(request.getAddress());
        existing.setCity(request.getCity());
        if (request.getLatitude() != null) existing.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) existing.setLongitude(request.getLongitude());
        if (request.getAllowedRadiusMeters() != null) existing.setAllowedRadiusMeters(request.getAllowedRadiusMeters());
        if (request.getStartDate() != null) existing.setStartDate(parseDate(request.getStartDate()));
        if (request.getEstimatedEndDate() != null) existing.setEstimatedEndDate(parseDate(request.getEstimatedEndDate()));
        if (request.getActualEndDate() != null) existing.setActualEndDate(parseDate(request.getActualEndDate()));
        if (request.getStatus() != null) existing.setStatus(ProjectStatus.valueOf(request.getStatus()));
        existing.setActive(request.isActive());

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
