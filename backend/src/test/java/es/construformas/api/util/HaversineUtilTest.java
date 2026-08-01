package es.construformas.api.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HaversineUtilTest {

    // Barcelona coordinates
    private static final double BARCELONA_LAT = 41.3874;
    private static final double BARCELONA_LON = 2.1686;

    @Test
    @DisplayName("Same point should return 0 distance")
    void calculateDistance_samePoint_shouldReturnZero() {
        double distance = HaversineUtil.calculateDistance(
                BARCELONA_LAT, BARCELONA_LON,
                BARCELONA_LAT, BARCELONA_LON);

        assertEquals(0.0, distance, 0.001);
    }

    @Test
    @DisplayName("Barcelona to Madrid (~505km)")
    void calculateDistance_barcelonaToMadrid_shouldBeAround505km() {
        // Madrid: 40.4168, -3.7038
        double distance = HaversineUtil.calculateDistance(
                BARCELONA_LAT, BARCELONA_LON,
                40.4168, -3.7038);

        assertEquals(505_000, distance, 5_000); // ±5km tolerance
    }

    @Test
    @DisplayName("10m offset should be within 50m radius")
    void isWithinRadius_10mOffset_shouldReturnTrue() {
        boolean result = HaversineUtil.isWithinRadius(
                BARCELONA_LAT + 0.0001, BARCELONA_LON,
                BARCELONA_LAT, BARCELONA_LON,
                50);

        assertTrue(result);
    }

    @Test
    @DisplayName("70m offset should be outside 50m radius")
    void isWithinRadius_70mOffset_shouldReturnFalse() {
        boolean result = HaversineUtil.isWithinRadius(
                BARCELONA_LAT + 0.00063, BARCELONA_LON,
                BARCELONA_LAT, BARCELONA_LON,
                50);

        assertFalse(result);
    }

    @Test
    @DisplayName("Exact boundary (49m) should be within radius")
    void isWithinRadius_49m_shouldReturnTrue() {
        // ~49m offset
        boolean result = HaversineUtil.isWithinRadius(
                BARCELONA_LAT + 0.00044, BARCELONA_LON,
                BARCELONA_LAT, BARCELONA_LON,
                50);

        assertTrue(result);
    }
}
