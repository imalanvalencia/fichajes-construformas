package es.construformas.api.integration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableMethodSecurity
@Profile("auth-test")
public class MethodSecurityTestConfig {

    @Bean
    public PasswordEncoder authTestPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
