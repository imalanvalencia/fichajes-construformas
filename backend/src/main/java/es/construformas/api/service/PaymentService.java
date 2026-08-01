package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.*;
import es.construformas.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Payment create(Payment payment) {
        Project project = projectRepository.findById(payment.getProject().getId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        Client client = clientRepository.findById(payment.getClient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        PaymentMethod method = paymentMethodRepository.findById(payment.getPaymentMethod().getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        User creator = userRepository.findById(payment.getCreatedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        payment.setProject(project);
        payment.setClient(client);
        payment.setPaymentMethod(method);
        payment.setCreatedBy(creator);

        return paymentRepository.save(payment);
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
