package com.erp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI institutionalErpOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Institutional ERP API")
                        .description("RESTful API documentation for Student Profile, Guardian Management, Document Management, and Status Tracking modules.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Institutional ERP Engineering Team")
                                .email("dev@institutional-erp.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")));
    }
}
