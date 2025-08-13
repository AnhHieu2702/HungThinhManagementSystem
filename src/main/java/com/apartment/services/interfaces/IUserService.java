package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.users.UserCreateRequest;
import com.apartment.models.dtos.users.UserGetsResponse;
import com.apartment.models.dtos.users.UserUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface IUserService {
    ApiResult<List<UserGetsResponse>> getsUser();

    ApiResult<UUID> createUser(UserCreateRequest apiRequest);

    ApiResult<String> updateUser(UUID userId, UserUpdateRequest apiRequest);

    ApiResult<String> deleteUser(UUID userId);
}
