package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.apartments.ApartmentCreateRequest;
import com.apartment.models.dtos.apartments.ApartmentGetsResponse;
import com.apartment.models.dtos.apartments.ApartmentUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface IApartmentService {
    ApiResult<List<ApartmentGetsResponse>> getApartments();

    ApiResult<UUID> createApartment(ApartmentCreateRequest apiRequest);

    ApiResult<String> updateApartment(UUID apartmentId, ApartmentUpdateRequest apiRequest);
}
