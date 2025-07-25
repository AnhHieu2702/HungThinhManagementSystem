package com.apartment.services.implement;

import com.apartment.models.dtos.auth.TokenResponse;
import com.apartment.models.security.JwtTokenProvider;
import com.apartment.services.interfaces.ITokenService;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class TokenService implements ITokenService {
    private final JwtTokenProvider tokenProvider;

    // Constructor injection
    public TokenService(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public TokenResponse generateTokens(UserDetails userDetails) {
        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.extractExpiration(accessToken).getTime())
                .build();
    }
}
