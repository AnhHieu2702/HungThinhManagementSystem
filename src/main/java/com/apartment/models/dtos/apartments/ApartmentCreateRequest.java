package com.apartment.models.dtos.apartments;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApartmentCreateRequest {
    // Apartment
    @NotBlank(message = "Vui lòng nhập số căn hộ")
    private String apartmentNumber;

    @NotNull(message = "Vui lòng nhập tầng")
    private Integer floor;

    private String block;

    private BigDecimal area;

    // User
    @NotBlank(message = "Vui lòng nhập tên đăng nhập")
    private String username;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}
