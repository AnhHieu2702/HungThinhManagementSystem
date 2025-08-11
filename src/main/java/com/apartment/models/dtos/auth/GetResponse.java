package com.apartment.models.dtos.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetResponse {
    private String fullName;
    private String apartmentNumber;
    private String relationship;
}
