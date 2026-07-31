package es.construformas.api.service;

import es.construformas.api.util.HaversineUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HaversineUtilTest {

    @Test
    @DisplayName("Madrid to Barcelona should be ~505km")
    void shouldCalculateDistanceCorrectly() {
        double distance = HaversineUtil.calculateDistance(40.4168, -3.7038, 41.3874, 2.1686);
        assertThat(distance).isBetween(500000.0, 510000.0);
    }

    @Test
    @DisplayName("Same coordinates should return 0")
    void shouldReturnZeroForSameCoordinates() {
        double distance = HaversineUtil.calculateDistance(40.0, -3.0, 40.0, -3.0);
        assertThat(distance).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Distance should always be positive")
    void shouldReturnPositiveDistance() {
        double distance = HaversineUtil.calculateDistance(40.0, -3.0, 41.0, -2.0);
        assertThat(distance).isPositive();
    }

    @Test
    @DisplayName("Close point should be within radius")
    void shouldDetectWithinRadius() {
        boolean within = HaversineUtil.isWithinRadius(40.0, -3.0, 40.0001, -3.0001, 100);
        assertThat(within).isTrue();
    }

    @Test
    @DisplayName("Distant point should be outside radius")
    void shouldDetectOutsideRadius() {
        boolean within = HaversineUtil.isWithinRadius(40.0, -3.0, 41.0, -2.0, 50);
        assertThat(within).isFalse();
    }

    @Test
    @DisplayName("Point exactly at boundary should be within")
    void shouldHandleBoundaryRadius() {
        boolean within = HaversineUtil.isWithinRadius(0.0, 0.0, 0.0, 0.0, 0);
        assertThat(within).isTrue();
    }

    @Test
    @DisplayName("Distance should be symmetric")
    void shouldSymmetric() {
        double d1 = HaversineUtil.calculateDistance(40.0, -3.0, 41.0, -2.0);
        double d2 = HaversineUtil.calculateDistance(41.0, -2.0, 40.0, -3.0);
        assertThat(d1).isEqualTo(d2);
    }
}
