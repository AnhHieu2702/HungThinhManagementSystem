package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.staffs.CreateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IUserService;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/staffs")
public class StaffController extends ApiBaseController {
    private final IUserService staffService;

    public StaffController(IUserService staffService) {
        this.staffService = staffService;
    }

    @PostMapping()
    public ResponseEntity<ApiResult<UUID>> createStaff(@RequestBody CreateRequest apiRequest) {
        return executeApiResult(() -> staffService.createStaff(apiRequest));
    }
}
