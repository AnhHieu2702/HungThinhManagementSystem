package com.apartment.models.dtos.users;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserCreateRequest {
    @NotBlank(message = "Vui long nhập tên đăng nhập")
    private String username;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;

    @NotBlank(message = "Vui lòng nhập vai trò")
    private String role;
}
