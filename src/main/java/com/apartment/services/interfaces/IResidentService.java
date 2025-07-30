package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.residents.ResidentCreateRequest;
import com.apartment.models.dtos.residents.ResidentGetsResponse;
import com.apartment.models.global.ApiResult;

public interface IResidentService {
    
    ApiResult<List<ResidentGetsResponse>> getResidentsByOwner();

    ApiResult<List<ResidentGetsResponse>> getResidentsByApartmentId(UUID apartmentId);

    ApiResult<UUID> createResident(UUID apartmentId, ResidentCreateRequest apiRequest);

    ApiResult<String> updateResident(UUID residentId, ResidentCreateRequest apiRequest);
}