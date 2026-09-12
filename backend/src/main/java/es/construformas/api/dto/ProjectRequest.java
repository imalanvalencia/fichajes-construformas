package es.construformas.api.dto;

import lombok.Data;

@Data
public class ProjectRequest {
    private Long clientId;
    private String name;
    private String description;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private Integer allowedRadiusMeters;
    private String startDate;
    private String estimatedEndDate;
    private String actualEndDate;
    private String status;
    private boolean active;
}
