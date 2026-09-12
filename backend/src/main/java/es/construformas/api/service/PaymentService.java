package es.construformas.api.service;

import es.construformas.api.dto.PaymentRequest;
import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import es.construformas.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;

    public Payment create(PaymentRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        PaymentMethod method = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        User creator = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        PaymentType type = request.getType() != null
                ? PaymentType.valueOf(request.getType())
                : PaymentType.PHASE_1;

        Payment payment = Payment.builder()
                .project(project)
                .client(client)
                .paymentMethod(method)
                .createdBy(creator)
                .amount(request.getAmount())
                .paymentDate(parseDate(request.getPaymentDate()))
                .reference(request.getReference())
                .type(type)
                .notes(request.getNotes())
                .build();

        if (request.getInvoiceId() != null) {
            Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                    .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
            payment.setInvoice(invoice);
        }

        return paymentRepository.save(payment);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateStr + ". Expected yyyy-MM-dd");
        }
    }

    public List<Payment> findAll() {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            List<Long> projectIds = operatorProjects.stream().map(Project::getId).toList();
            return paymentRepository.findByProjectIdIn(projectIds);
        }
        return paymentRepository.findAll();
    }

    public Payment findById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!projectRepository.existsByProjectIdAndOperatorId(payment.getProject().getId(), user.getId())) {
                throw new IllegalArgumentException("Access denied: not assigned to this project");
            }
        }
        return payment;
    }

    public List<Payment> findByProject(Long projectId) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            if (!projectRepository.existsByProjectIdAndOperatorId(projectId, user.getId())) {
                throw new IllegalArgumentException("Access denied: not assigned to this project");
            }
        }
        return paymentRepository.findByProjectId(projectId);
    }

    public List<Payment> findByClient(Long clientId) {
        if (SecurityUtils.hasRole("OPERATOR")) {
            User user = SecurityUtils.getCurrentUser(userRepository);
            List<Project> operatorProjects = projectRepository.findByOperatorId(user.getId());
            List<Long> projectIds = operatorProjects.stream().map(Project::getId).toList();
            return paymentRepository.findByProjectIdIn(projectIds);
        }
        return paymentRepository.findByClientId(clientId);
    }

    public List<PaymentMethod> getPaymentMethods() {
        return paymentMethodRepository.findByActive(true);
    }
}
