package com.apartment.services.implement;

import java.util.List;
import java.util.UUID;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.users.UserCreateRequest;
import com.apartment.models.dtos.users.UserGetsResponse;
import com.apartment.models.dtos.users.UserUpdateRequest;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.enums.UserRole;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.UserRepository;
import com.apartment.services.interfaces.IUserService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor injection
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
            this.userRepository = userRepository;
            this.passwordEncoder = passwordEncoder;
    }

    @Override
    public ApiResult<List<UserGetsResponse>> getsUser() {
        List<User> users = userRepository.findAll();
        List<UserGetsResponse> responseList = users.stream()
                .map(user -> new UserGetsResponse(user.getUsername(), user.getRole().name()))
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách người dùng thành công");
    }

    @Override
    public ApiResult<UUID> createUser(UserCreateRequest apiRequest) {
        if (userRepository.existsByUsername(apiRequest.getUsername())) {
            throw new UserMessageException("Tên đăng nhập đã tồn tại");
        }

        String hashedPassword = passwordEncoder.encode(apiRequest.getPassword());

        User newUser = User.builder()
                .username(apiRequest.getUsername())
                .password(hashedPassword)
                .role(UserRole.valueOf(apiRequest.getRole()))
                .build();

        userRepository.save(newUser);

        return ApiResult.success(newUser.getId(), "Thêm mới người dùng thành công");
    }

    @Override
    public ApiResult<String> updateUser(UUID userId, UserUpdateRequest apiRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

        user.setUsername(apiRequest.getUsername());
        user.setRole(UserRole.valueOf(apiRequest.getRole()));
        userRepository.save(user);

        return ApiResult.success(null, "Cập nhật người dùng thành công");
    }
}
