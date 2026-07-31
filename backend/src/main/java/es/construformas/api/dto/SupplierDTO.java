package es.construformas.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {
    private Long id;
    @NotBlank
    private String name;
    private String contactName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String postalCode;
    private String taxId;
    private String bankAccount;
    private String notes;
    private boolean active;
}
