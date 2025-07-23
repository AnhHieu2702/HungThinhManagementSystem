package com.apartment.services.implement;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.apartment.models.dtos.residents.ResidentCreateRequest;
import com.apartment.models.dtos.users.UserCreateRequest;
import com.apartment.models.entities.bases.Resident;
import com.apartment.models.entities.enums.RelationshipType;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.ResidentRepository;
import com.apartment.services.interfaces.IResidentService;

import jakarta.transaction.Transactional;

@Service
public class ResidentService implements IResidentService {
    private final UserService userService;
    private final ResidentRepository residentRepository;


    public ResidentService(UserService userService, ResidentRepository residentRepository) {
        this.userService = userService;
        this.residentRepository = residentRepository;
    }

    @Override
    @Transactional
    public ApiResult<UUID> createResident(UUID apartmentId, ResidentCreateRequest apiRequest) {
        if (apartmentId == null || apiRequest == null) {
            return ApiResult.fail("Apartment ID or Resident request cannot be null");
        }

        UserCreateRequest userCreateRequest = UserCreateRequest.builder()
                .username(apiRequest.getEmail())
                .password(apiRequest.getPhone())
                .role("RESIDENT")
                .build();
        userService.createUser(userCreateRequest);


        Resident newResident = Resident.builder()
                .fullName(apiRequest.getFullname())
                .phone(apiRequest.getPhone())
                .email(apiRequest.getEmail())
                .relationship(RelationshipType.valueOf(apiRequest.getRelation()))
                .build();
        residentRepository.save(newResident);

        return ApiResult.success(newResident.getId(), "Thêm mới cư dân thành công");
    }

    
}
