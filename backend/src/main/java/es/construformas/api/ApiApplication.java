package es.construformas.api;

import es.construformas.api.health.BufferingApplicationStartupInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApiApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(ApiApplication.class);
		application.setApplicationStartup(new BufferingApplicationStartup(
				BufferingApplicationStartupInitializer.CAPACITY));
		application.run(args);
	}

}
