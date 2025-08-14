package com.apartment.services.implement;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.apartment.models.dtos.apartments.ApartmentCreateRequest;
import com.apartment.models.dtos.apartments.ApartmentGetsResponse;
import com.apartment.models.dtos.apartments.ApartmentUpdateRequest;
import com.apartment.models.dtos.users.UserCreateRequest;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.bases.Apartment;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.ApartmentRepository;
import com.apartment.repositories.UserRepository;
import com.apartment.services.interfaces.IApartmentService;

import jakarta.transaction.Transactional;

@Service
public class ApartmentService implements IApartmentService {
        private final UserService userService;
        private final UserRepository userRepository;
        private final ApartmentRepository apartmentRepository;

        public ApartmentService(UserService userService, UserRepository userRepository,
                        ApartmentRepository apartmentRepository) {
                this.userService = userService;
                this.userRepository = userRepository;
                this.apartmentRepository = apartmentRepository;
        }

        @Override
        public ApiResult<List<ApartmentGetsResponse>> getApartments() {
                List<Apartment> apartments = apartmentRepository.findAll();

                List<ApartmentGetsResponse> responseList = apartments.stream()
                                .map(apartment -> ApartmentGetsResponse.builder()
                                                .id(apartment.getId())
                                                .apartmentNumber(apartment.getApartmentNumber())
                                                .floor(apartment.getFloor())
                                                .block(apartment.getBlock())
                                                .area(apartment.getArea())
                                                .status(apartment.getStatus().getDisplayName())
                                                .build())
                                .collect(Collectors.toList());

                return ApiResult.success(responseList, "Lấy danh sách căn hộ thành công");
        }

        @Override
        @Transactional
        public ApiResult<UUID> createApartment(ApartmentCreateRequest apiRequest) {

                UserCreateRequest userCreateRequest = UserCreateRequest.builder()
                                .username(apiRequest.getUsername())
                                .password(apiRequest.getPassword())
                                .role("RESIDENT")
                                .build();
                ApiResult<UUID> userResult = userService.createUser(userCreateRequest);

                // Lấy User vừa tạo từ database
                User owner = userRepository.findById(userResult.getData())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Apartment newApartment = Apartment.builder()
                                .apartmentNumber(apiRequest.getApartmentNumber())
                                .floor(apiRequest.getFloor())
                                .block(apiRequest.getBlock())
                                .area(apiRequest.getArea())
                                .owner(owner)
                                .build();
                apartmentRepository.save(newApartment);

                return ApiResult.success(newApartment.getId(), "Thêm mới căn hộ thành công");
        }

        @Override
        public ApiResult<String> updateApartment(UUID apartmentId, ApartmentUpdateRequest apiRequest) {
                Apartment apartment = apartmentRepository.findById(apartmentId)
                                .orElseThrow(() -> new IllegalArgumentException("Căn hộ không tồn tại"));

                apartment.setApartmentNumber(apiRequest.getApartmentNumber());
                apartment.setFloor(apiRequest.getFloor());
                apartment.setBlock(apiRequest.getBlock());
                apartment.setArea(apiRequest.getArea());

                apartmentRepository.save(apartment);

                return ApiResult.success(null, "Cập nhật căn hộ thành công");
        }

        @Override
        public ApiResult<String> deleteApartment(UUID apartmentId) {
                Apartment apartment = apartmentRepository.findById(apartmentId)
                                .orElseThrow(() -> new IllegalArgumentException("Căn hộ không tồn tại"));
                apartmentRepository.delete(apartment);
                return ApiResult.success(null, "Xóa căn hộ thành công");
        }
}
