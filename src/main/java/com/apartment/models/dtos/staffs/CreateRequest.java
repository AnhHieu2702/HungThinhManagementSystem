package com.apartment.models.dtos.staffs;

import lombok.Data;

@Data
public class CreateRequest {
    private String username;
    private String password;
    private String role;
}
