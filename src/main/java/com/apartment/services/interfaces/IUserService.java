package com.apartment.services.interfaces;

import java.util.UUID;

import com.apartment.models.dtos.users.UserCreateRequest;
import com.apartment.models.global.ApiResult;

public interface IUserService {
    ApiResult<UUID> createUser(UserCreateRequest user);
}
