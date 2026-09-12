package es.construformas.api.integration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Year;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AutomaticQuoteInvoicingPostgresIT {

    private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");
    private static final AtomicInteger USER_SEQUENCE = new AtomicInteger();

    @BeforeAll
    static void migrateDatabase() {
        POSTGRES.start();
        Flyway.configure()
            .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
            .load()
            .migrate();
    }

    @AfterAll
    static void stopDatabase() {
        POSTGRES.stop();
    }

    @Test
    void migrationEnforcesOneAutomaticInvoicePerSourceBudget() throws SQLException {
        long userId = insertUser();
        long clientId = insertClient();
        long projectId = insertProject(clientId);
        long budgetId = insertBudget(projectId, userId);

        insertInvoice(projectId, clientId, userId, budgetId, "INV-2026-001");

        assertThrows(SQLException.class,
            () -> insertInvoice(projectId, clientId, userId, budgetId, "INV-2026-002"));
    }

    @Test
    void migrationAllocatesDistinctContiguousValuesForConcurrentRequests() throws Exception {
        int year = Year.now().getValue();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            List<Callable<Integer>> allocations = List.of(
                () -> allocateNextInvoiceNumber(year),
                () -> allocateNextInvoiceNumber(year)
            );

            List<Future<Integer>> results = executor.invokeAll(allocations);
            List<Integer> values = results.stream()
                .map(AutomaticQuoteInvoicingPostgresIT::getResult)
                .sorted()
                .toList();

            assertEquals(List.of(1, 2), values);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void migrationRejectsLifecycleEventUpdatesAndDeletes() throws SQLException {
        long userId = insertUser();
        long eventId;
        try (Connection connection = connection();
             PreparedStatement statement = connection.prepareStatement(
                 "INSERT INTO document_lifecycle_events (event_type, actor_id, occurred_at) "
                     + "VALUES ('INVOICE_CREATED', ?, CURRENT_TIMESTAMP)",
                 Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, userId);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                keys.next();
                eventId = keys.getLong(1);
            }
        }

        long persistedEventId = eventId;
        assertThrows(SQLException.class, () -> executeUpdate(
            "UPDATE document_lifecycle_events SET event_type = 'BUDGET_APPROVED' WHERE id = " + persistedEventId));
        assertThrows(SQLException.class, () -> executeUpdate(
            "DELETE FROM document_lifecycle_events WHERE id = " + persistedEventId));
    }

    private static int allocateNextInvoiceNumber(int year) throws SQLException {
        try (Connection connection = connection();
             PreparedStatement statement = connection.prepareStatement(
                 "INSERT INTO invoice_year_sequences (year, last_value) VALUES (?, 1) "
                     + "ON CONFLICT (year) DO UPDATE SET last_value = invoice_year_sequences.last_value + 1 "
                     + "RETURNING last_value")) {
            statement.setInt(1, year);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private static int getResult(Future<Integer> result) {
        try {
            return result.get();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AssertionError(exception);
        } catch (ExecutionException exception) {
            throw new AssertionError(exception.getCause());
        }
    }

    private static long insertUser() throws SQLException {
        return insertAndGetId("INSERT INTO users (name, email, password, availability, active) "
            + "VALUES ('Test User', 'test-" + USER_SEQUENCE.incrementAndGet()
            + "@example.com', 'hash', 'AVAILABLE', TRUE)");
    }

    private static long insertClient() throws SQLException {
        return insertAndGetId("INSERT INTO clients (name) VALUES ('Test Client')");
    }

    private static long insertProject(long clientId) throws SQLException {
        return insertAndGetId("INSERT INTO projects (client_id, name, address, latitude, longitude, status, active) "
            + "VALUES (" + clientId + ", 'Test Project', 'Test address', 0, 0, 'PLANNED', TRUE)");
    }

    private static long insertBudget(long projectId, long userId) throws SQLException {
        return insertAndGetId("INSERT INTO budgets (project_id, version, budget_type, status, total_amount, discount_amount, "
            + "final_amount, created_by) VALUES (" + projectId + ", 1, 'ORIGINAL', 'DRAFT', 0, 0, 0, " + userId + ")");
    }

    private static void insertInvoice(long projectId, long clientId, long userId, long budgetId, String number)
        throws SQLException {
        executeUpdate("INSERT INTO invoices (project_id, client_id, invoice_number, status, subtotal, tax_rate, tax_amount, "
            + "total, created_by, source_budget_id) VALUES (" + projectId + ", " + clientId + ", '" + number
            + "', 'DRAFT', " + BigDecimal.ZERO + ", 21, 0, 0, " + userId + ", " + budgetId + ")");
    }

    private static long insertAndGetId(String sql) throws SQLException {
        try (Connection connection = connection();
             Statement statement = connection.createStatement()) {
            statement.executeUpdate(sql, Statement.RETURN_GENERATED_KEYS);
            try (ResultSet keys = statement.getGeneratedKeys()) {
                keys.next();
                return keys.getLong(1);
            }
        }
    }

    private static void executeUpdate(String sql) throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.executeUpdate(sql);
        }
    }

    private static Connection connection() throws SQLException {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }
}
