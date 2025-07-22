package com.apartment.services.interfaces;

import java.util.UUID;

import com.apartment.models.dtos.staffs.CreateRequest;
import com.apartment.models.global.ApiResult;

public interface IUserService {
    ApiResult<UUID> createStaff(CreateRequest user);
}
