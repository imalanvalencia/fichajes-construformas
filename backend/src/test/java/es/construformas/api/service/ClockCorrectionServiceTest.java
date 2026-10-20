package es.construformas.api.service;

import es.construformas.api.model.*;
import es.construformas.api.repository.ClockCorrectionRepository;
import es.construformas.api.repository.ClockEntryRepository;
import es.construformas.api.repository.ProjectRepository;
import es.construformas.api.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClockCorrectionServiceTest {

    @Mock
    private ClockCorrectionRepository correctionRepository;
    @Mock
    private ClockEntryRepository clockEntryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ClockCorrectionService correctionService;

    private User user;
    private Project project;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    /** Puts a user in the security context, mirroring what JwtAuthFilter does at runtime. */
    private User authenticate(User authenticated, String roleName) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        authenticated.getEmail(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + roleName))));
        when(userRepository.findByEmail(authenticated.getEmail())).thenReturn(Optional.of(authenticated));
        return authenticated;
    }

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).name("Test").build();
        project = Project.builder().id(1L).name("Obra").build();
    }

    @Test
    @DisplayName("requestCorrection: duplicate pending should throw")
    void requestCorrection_duplicatePending_shouldThrow() {
        authenticate(User.builder().id(1L).email("worker@test.com").build(), "OPERATOR");
        ClockCorrection correction = ClockCorrection.builder()
                .user(user)
                .project(project)
                .correctionDate(LocalDate.now())
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.now())
                .reason("Test")
                .build();

        when(correctionRepository
                .existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(
                        any(), any(), any(), any()))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> correctionService.requestCorrection(correction));
    }

    @Test
    @DisplayName("requestCorrection: new correction should save")
    void requestCorrection_new_shouldSave() {
        authenticate(User.builder().id(1L).email("worker@test.com").build(), "OPERATOR");
        ClockCorrection correction = ClockCorrection.builder()
                .user(user)
                .project(project)
                .correctionDate(LocalDate.now())
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.now())
                .reason("Test")
                .build();

        when(correctionRepository
                .existsByUserIdAndCorrectionDateAndOriginalClockTypeAndStatus(
                        any(), any(), any(), any()))
                .thenReturn(false);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(correctionRepository.save(any())).thenReturn(correction);

        ClockCorrection result = correctionService.requestCorrection(correction);

        assertEquals(CorrectionStatus.PENDING, result.getStatus());
    }

    @Test
    @DisplayName("requestCorrection: an OPERATOR cannot request a correction for another user")
    void requestCorrection_forAnotherUser_shouldBeDenied() {
        authenticate(User.builder().id(1L).email("worker@test.com").build(), "OPERATOR");
        ClockCorrection correction = ClockCorrection.builder()
                .user(User.builder().id(2L).build())
                .project(project)
                .correctionDate(LocalDate.now())
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.now())
                .reason("Test")
                .build();

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> correctionService.requestCorrection(correction));
    }

    @Test
    @DisplayName("approve: pending correction should create new entry")
    void approve_pendingCorrection_shouldCreateEntry() {
        User reviewer = authenticate(
                User.builder().id(1L).email("admin@test.com").build(), "ADMIN");
        ClockCorrection correction = ClockCorrection.builder()
                .id(1L)
                .user(user)
                .project(project)
                .status(CorrectionStatus.PENDING)
                .originalClockType(ClockType.ENTRY)
                .correctedTime(LocalDateTime.now())
                .reason("Forgot to clock in")
                .build();

        when(correctionRepository.findById(1L))
                .thenReturn(Optional.of(correction));
        when(correctionRepository.save(any())).thenReturn(correction);
        when(clockEntryRepository.save(any())).thenReturn(null);

        ClockCorrection result = correctionService.approve(1L);

        assertEquals(CorrectionStatus.APPROVED, result.getStatus());
        assertEquals(reviewer, result.getReviewedBy());
    }

    @Test
    @DisplayName("reject: pending correction should update status")
    void reject_pendingCorrection_shouldUpdateStatus() {
        User reviewer = authenticate(
                User.builder().id(1L).email("admin@test.com").build(), "ADMIN");
        ClockCorrection correction = ClockCorrection.builder()
                .id(1L)
                .user(user)
                .project(project)
                .status(CorrectionStatus.PENDING)
                .build();

        when(correctionRepository.findById(1L))
                .thenReturn(Optional.of(correction));
        when(correctionRepository.save(any())).thenReturn(correction);

        ClockCorrection result = correctionService.reject(1L);

        assertEquals(CorrectionStatus.REJECTED, result.getStatus());
        assertEquals(reviewer, result.getReviewedBy());
    }
}
