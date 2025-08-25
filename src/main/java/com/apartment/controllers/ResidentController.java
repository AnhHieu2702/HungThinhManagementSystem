package com.apartment.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.residents.ResidentCreateRequest;
import com.apartment.models.dtos.residents.ResidentGetsResponse;
import com.apartment.models.dtos.residents.ResidentUpdateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IResidentService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@Tag(name = "Resident Management")
public class ResidentController extends ApiBaseController {
    private final IResidentService residentService;

    public ResidentController(IResidentService residentService) {
        this.residentService = residentService;
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("residents")
    public ResponseEntity<ApiResult<List<ResidentGetsResponse>>> getResidentsByOwner() {
        return executeApiResult(() -> residentService.getResidentsByOwner());
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('RESIDENT')")
    @GetMapping("admin-resident/apartments/{apartmentId}/residents")
    public ResponseEntity<ApiResult<List<ResidentGetsResponse>>> getResidentsByApartmentId(@PathVariable UUID apartmentId) {
        return executeApiResult(() -> residentService.getResidentsByApartmentId(apartmentId));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("admin/apartments/{apartmentId}/residents")
    public ResponseEntity<ApiResult<UUID>> createResident(@PathVariable UUID apartmentId, @Valid @RequestBody ResidentCreateRequest apiRequest) {
        return executeApiResult(() -> residentService.createResident(apartmentId, apiRequest));
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('RESIDENT')")
    @PutMapping("admin-resident/apartments/residents/{residentId}")
    public ResponseEntity<ApiResult<String>> updateResident(@PathVariable UUID residentId, @Valid @RequestBody ResidentUpdateRequest apiRequest) {
        return executeApiResult(() -> residentService.updateResident(residentId, apiRequest));
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('RESIDENT')")
    @DeleteMapping("admin-resident/apartments/residents/{residentId}")
    public ResponseEntity<ApiResult<String>> deleteResident(@PathVariable UUID residentId) {
        return executeApiResult(() -> residentService.deleteResident(residentId));
    }
}
 