package com.apartment.models.dtos.users;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserGetsResponse {
    private UUID id;
    private String username;
    private String role;
    private LocalDateTime createTime;
    private LocalDateTime lastModifiedTime;
}
