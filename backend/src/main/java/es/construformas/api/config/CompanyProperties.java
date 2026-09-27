package es.construformas.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Company branding data rendered into generated PDF documents.
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.pdf.company")
public class CompanyProperties {

    private String name;
    private String logoPath;
    private String address;
    private String taxId;
}
