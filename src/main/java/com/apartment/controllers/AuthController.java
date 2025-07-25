package com.apartment.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.apartment.models.dtos.auth.LoginRequest;
import com.apartment.models.dtos.auth.TokenResponse;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.ITokenService;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController extends ApiBaseController {
    private final AuthenticationManager authenticationManager;
    private final ITokenService tokenService;

    // Constructor injection
    public AuthController(AuthenticationManager authenticationManager, ITokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResult<TokenResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            TokenResponse tokens = tokenService.generateTokens(userDetails);
            return ResponseEntity.ok(ApiResult.success(tokens, "Đăng nhập thành công"));
        } catch (BadCredentialsException ex) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResult.fail("Tên đăng nhập hoặc mật khẩu không chính xác"));
        }
    }
} 
