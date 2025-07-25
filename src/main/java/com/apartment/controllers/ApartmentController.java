package com.apartment.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.apartments.ApartmentCreateRequest;
import com.apartment.models.dtos.apartments.ApartmentGetsResponse;
import com.apartment.models.dtos.apartments.ApartmentUpdateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IApartmentService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/apartments")
@Tag(name = "Apartment Management")
@PreAuthorize("hasRole('ADMIN')")
public class ApartmentController extends ApiBaseController {
    private final IApartmentService apartmentService;

    public ApartmentController(IApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResult<List<ApartmentGetsResponse>>> getApartments() {
        return executeApiResult(() -> apartmentService.getApartments());
    }

    @PostMapping
    public ResponseEntity<ApiResult<UUID>> createApartment(@Valid @RequestBody ApartmentCreateRequest apiRequest) {
        return executeApiResult(() -> apartmentService.createApartment(apiRequest));
    }

    @PutMapping("/{apartmentId}")
    public ResponseEntity<ApiResult<String>> updateApartment(@PathVariable UUID apartmentId, @Valid @RequestBody ApartmentUpdateRequest apiRequest) {
        return executeApiResult(() -> apartmentService.updateApartment(apartmentId, apiRequest));
    }
}
