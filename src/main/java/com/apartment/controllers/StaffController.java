package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.users.UserCreateRequest;
import com.apartment.models.dtos.users.UserGetsResponse;
import com.apartment.models.dtos.users.UserUpdateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IUserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/admin/staffs")
@Tag(name = "Staff Management")
@PreAuthorize("hasRole('ADMIN')")
public class StaffController extends ApiBaseController {
    private final IUserService staffService;

    public StaffController(IUserService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<ApiResult<List<UserGetsResponse>>> getsStaff() {
        return executeApiResult(() -> staffService.getsUser());
    }

    @PostMapping
    public ResponseEntity<ApiResult<UUID>> createStaff(@Valid @RequestBody UserCreateRequest apiRequest) {
        return executeApiResult(() -> staffService.createUser(apiRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResult<String>> updateStaff(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequest apiRequest) {
        return executeApiResult(() -> staffService.updateUser(id, apiRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResult<String>> deleteStaff(@PathVariable UUID id) {
        return executeApiResult(() -> staffService.deleteUser(id));
    }
}
