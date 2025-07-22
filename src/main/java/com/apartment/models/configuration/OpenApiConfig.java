package com.apartment.models.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
//import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
// import io.swagger.v3.oas.models.security.SecurityRequirement;
// import io.swagger.v3.oas.models.security.SecurityScheme;
// import io.swagger.v3.oas.models.Components;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hung Thinh Apartment Information Management System API")
                        .description("Hệ thống thông tin quản lý Chung cư Hưng Thịnh - API Documentation")
                        .version("v1.0"))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development Server")));
        // // Thêm cấu hình Authorization
        // .components(new Components()
        // .addSecuritySchemes("Bearer Token",
        // new SecurityScheme()
        // .type(SecurityScheme.Type.HTTP)
        // .scheme("bearer")
        // .bearerFormat("JWT")
        // .description("Nhập JWT token để xác thực")))
        // .addSecurityItem(new SecurityRequirement()
        // .addList("Bearer Token"));
    }
}

