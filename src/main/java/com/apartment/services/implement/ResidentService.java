package com.apartment.services.implement;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.apartment.models.dtos.residents.ResidentCreateRequest;
import com.apartment.models.dtos.residents.ResidentGetsResponse;
import com.apartment.models.entities.bases.Apartment;
import com.apartment.models.entities.bases.Resident;
import com.apartment.models.entities.enums.RelationshipType;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.ApartmentRepository;
import com.apartment.repositories.ResidentRepository;
import com.apartment.services.interfaces.IResidentService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ResidentService implements IResidentService {
    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;


    public ResidentService(ApartmentRepository apartmentRepository, ResidentRepository residentRepository) {
        this.apartmentRepository = apartmentRepository;
        this.residentRepository = residentRepository;
    }

    @Override
    public ApiResult<List<ResidentGetsResponse>> getResidentsByApartmentId(UUID apartmentId) {
        List<Resident> residents = residentRepository.findByApartmentId(apartmentId);

        List<ResidentGetsResponse> responseList = residents.stream()
                .map(resident -> ResidentGetsResponse.builder()
                        .id(resident.getId())
                        .fullname(resident.getFullName())
                        .dateOfBirth(resident.getDateOfBirth())
                        .email(resident.getEmail())
                        .phone(resident.getPhone())
                        .relation(resident.getRelationship().getDisplayName())
                        .build())
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách cư dân thành công");
    }

    @Override
    public ApiResult<UUID> createResident(UUID apartmentId, ResidentCreateRequest apiRequest) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Căn hộ không tồn tại"));
        
        Resident newResident = Resident.builder()
                .fullName(apiRequest.getFullname())
                .phone(apiRequest.getPhone())
                .email(apiRequest.getEmail())
                .dateOfBirth(apiRequest.getDateOfBirth())
                .relationship(RelationshipType.valueOf(apiRequest.getRelation()))
                .apartment(apartment)
                .build();
        residentRepository.save(newResident);

        return ApiResult.success(newResident.getId(), "Thêm mới cư dân thành công");
    }

    @Override
    public ApiResult<String> updateResident(UUID residentId, ResidentCreateRequest apiRequest) {
        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new IllegalArgumentException("Cư dân không tồn tại"));

        resident.setFullName(apiRequest.getFullname());
        resident.setPhone(apiRequest.getPhone());
        resident.setEmail(apiRequest.getEmail());
        resident.setDateOfBirth(apiRequest.getDateOfBirth());
        resident.setRelationship(RelationshipType.valueOf(apiRequest.getRelation()));

        residentRepository.save(resident);

        return ApiResult.success(null, "Cập nhật thông tin cư dân thành công");
    }
}
