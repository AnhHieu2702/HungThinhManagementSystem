package com.apartment.models.dtos.residents;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResidentUpdateRequest {
     // Resident
    @NotBlank(message = "Vui lòng nhập họ và tên")
    private String fullname;

    private LocalDate dateOfBirth;

    private String email;

    @NotBlank(message = "Vui lòng nhập số điện thoại")
    private String phone;
}

