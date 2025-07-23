package com.apartment.services.interfaces;

import java.util.UUID;

import com.apartment.models.dtos.resident.ResidentCreateRequest;
import com.apartment.models.global.ApiResult;

public interface IResidentService {
    ApiResult<UUID> createResident(UUID apartmentId, ResidentCreateRequest apiRequest);
}
