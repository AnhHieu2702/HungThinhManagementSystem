package com.apartment.services.interfaces;

import org.springframework.security.core.userdetails.UserDetails;

import com.apartment.models.dtos.auth.GetResponse;
import com.apartment.models.dtos.auth.TokenResponse;
import com.apartment.models.dtos.residents.ResidentGetsResponse;
import com.apartment.models.global.ApiResult;

import java.util.List;

import org.springframework.security.core.Authentication;

public interface ITokenService {
    TokenResponse generateTokens(UserDetails userDetails);

    public ApiResult<GetResponse> getUserInfo(Authentication authentication);

    public ApiResult<List<ResidentGetsResponse>> getResidents(Authentication authentication);
}
