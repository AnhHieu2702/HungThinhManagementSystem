package com.apartment.services.interfaces;

import org.springframework.security.core.userdetails.UserDetails;

import com.apartment.models.dtos.auth.TokenResponse;

public interface ITokenService {
    TokenResponse generateTokens(UserDetails userDetails);
}
