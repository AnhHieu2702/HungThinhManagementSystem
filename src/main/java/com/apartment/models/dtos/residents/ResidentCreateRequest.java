package com.apartment.models.dtos.resident;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResidentCreateRequest {
    // Resident
    @NotBlank(message = "Vui long nhập họ và tên")
    private String fullname;

    private LocalDate dateOfBirth;

    private String email;

    private String phone;

    @NotBlank(message = "Vui lòng nhập quan hệ với chủ hộ")
    private String relation;    

    // User
    @NotBlank(message = "Vui lòng nhập tên đăng nhập")
    private String username;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}
