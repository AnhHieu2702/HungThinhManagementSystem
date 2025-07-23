package com.apartment.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.residents.ResidentCreateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IResidentService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/apartments")
@Tag(name = "Staff Management")
public class ResidentController extends ApiBaseController {
    private final IResidentService residentService;

    public ResidentController(IResidentService residentService) {
        this.residentService = residentService;
    }

    @PostMapping("/{apartmentId}/residents")
    public ResponseEntity<ApiResult<UUID>> createResident(@PathVariable UUID apartmentId, @Valid @RequestBody ResidentCreateRequest apiRequest) {
        return executeApiResult(() -> residentService.createResident(apartmentId, apiRequest));
    }
}
