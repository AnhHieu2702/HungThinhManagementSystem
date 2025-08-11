package com.apartment.services.implement;

import com.apartment.models.dtos.auth.GetResponse;
import com.apartment.models.dtos.auth.TokenResponse;
import com.apartment.models.dtos.residents.ResidentGetsResponse;
import com.apartment.models.entities.bases.Apartment;
import com.apartment.models.entities.bases.Resident;
import com.apartment.models.entities.enums.RelationshipType;
import com.apartment.models.global.ApiResult;
import com.apartment.models.security.JwtTokenProvider;
import com.apartment.models.security.UserPrincipal;
import com.apartment.repositories.ApartmentRepository;
import com.apartment.repositories.ResidentRepository;
import com.apartment.services.interfaces.ITokenService;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class TokenService implements ITokenService {
    private final JwtTokenProvider tokenProvider;
    private final ResidentRepository residentRepository;
    private final ApartmentRepository apartmentRepository;
    private final ResidentService residentService;

    // Constructor injection
    public TokenService(JwtTokenProvider tokenProvider, ResidentRepository residentRepository, 
                        ApartmentRepository apartmentRepository, ResidentService residentService) {
        this.apartmentRepository = apartmentRepository;
        this.residentRepository = residentRepository;
        this.tokenProvider = tokenProvider;
        this.residentService = residentService;
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

    @Override
    public ApiResult<GetResponse> getUserInfo(Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);

        Resident owner = residentRepository
            .findOwnerInfoByUserId(userId, RelationshipType.OWNER)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin chủ hộ"));
        
        GetResponse response = GetResponse.builder()
                .fullName(owner.getFullName())
                .apartmentNumber(owner.getApartment().getApartmentNumber())
                .relationship(owner.getRelationship().getDisplayName())
                .build();

        return ApiResult.success(response, "Lấy thông tin người dùng thành công");
    }


    @Override
    public ApiResult<List<ResidentGetsResponse>> getResidents(Authentication authentication) {
        UUID userId = getUserIdFromAuthentication(authentication);

        Apartment apartment = apartmentRepository
            .findByOwnerId(userId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin căn hộ"));
       
        List<ResidentGetsResponse> residents = residentService.getResidentsByApartmentId(apartment.getId()).getData();

        return ApiResult.success(residents, "Lấy danh sách cư dân thành công");

    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Không xác định được người dùng");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getId();
        }
        throw new RuntimeException("Principal không chứa thông tin userId");
    }

}
