package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.staffs.CreateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IUserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/staffs")
@Tag(name = "Staff Management")
public class StaffController extends ApiBaseController {
    private final IUserService staffService;

    public StaffController(IUserService staffService) {
        this.staffService = staffService;
    }

    @PostMapping()
    public ResponseEntity<ApiResult<UUID>> createStaff(@Valid @RequestBody CreateRequest apiRequest) {
        return executeApiResult(() -> staffService.createStaff(apiRequest));
    }
}
