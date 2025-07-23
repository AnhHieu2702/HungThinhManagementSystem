package com.apartment.services.implement;

import java.util.UUID;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.users.UserCreateRequest;
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

        return ApiResult.success(null, "Thêm mới người dùng thành công");
    }
}
