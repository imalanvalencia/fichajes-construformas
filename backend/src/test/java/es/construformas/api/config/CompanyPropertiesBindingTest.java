package es.construformas.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

/** Proves Spring binds app.pdf.company.* keys (verify PARTIAL promotion). */
class CompanyPropertiesBindingTest {

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(CompanyProperties.class)
    static class Config {
    }

    @Test
    void bindsAppPdfCompanyKeys() {
        new ApplicationContextRunner().withUserConfiguration(Config.class)
                .withPropertyValues("app.pdf.company.name=Construformas S.L.",
                        "app.pdf.company.tax-id=B12345678",
                        "app.pdf.company.address=C/ Ejemplo 12",
                        "app.pdf.company.logo-path=classpath:logo.png")
                .run(ctx -> {
                    CompanyProperties p = ctx.getBean(CompanyProperties.class);
                    assertThat(p.getName()).isEqualTo("Construformas S.L.");
                    assertThat(p.getTaxId()).isEqualTo("B12345678");
                    assertThat(p.getAddress()).isEqualTo("C/ Ejemplo 12");
                    assertThat(p.getLogoPath()).isEqualTo("classpath:logo.png");
                });
    }
}
