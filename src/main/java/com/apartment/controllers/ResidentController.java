package com.apartment.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.residents.ResidentCreateRequest;
import com.apartment.models.dtos.residents.ResidentGetsResponse;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IResidentService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/apartments")
@Tag(name = "Resident Management")
public class ResidentController extends ApiBaseController {
    private final IResidentService residentService;

    public ResidentController(IResidentService residentService) {
        this.residentService = residentService;
    }

    @GetMapping("/{apartmentId}/residents")
    public ResponseEntity<ApiResult<List<ResidentGetsResponse>>> getResidentsByApartmentId(@PathVariable UUID apartmentId) {
        return executeApiResult(() -> residentService.getResidentsByApartmentId(apartmentId));
    }

    @PostMapping("/{apartmentId}/residents")
    public ResponseEntity<ApiResult<UUID>> createResident(@PathVariable UUID apartmentId, @Valid @RequestBody ResidentCreateRequest apiRequest) {
        return executeApiResult(() -> residentService.createResident(apartmentId, apiRequest));
    }

    @PutMapping("/residents/{residentId}")
    public ResponseEntity<ApiResult<String>> updateResident(@PathVariable UUID residentId, @Valid @RequestBody ResidentCreateRequest apiRequest) {
        return executeApiResult(() -> residentService.updateResident(residentId, apiRequest));
    }
}
 