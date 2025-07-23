package com.apartment.models.dtos.apartments;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApartmentUpdateRequest {
  // Apartment
    @NotBlank(message = "Vui lòng nhập số căn hộ")
    private String apartmentNumber;

    @NotNull(message = "Vui lòng nhập tầng")
    private Integer floor;

    private String block;

    private BigDecimal area;
}
