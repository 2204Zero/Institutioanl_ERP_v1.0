package com.example.demo.Controller;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RefreshTokenRequest;
import com.example.demo.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;

    public AuthController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        if ("user".equals(request.getUsername()) && "password".equals(request.getPassword())) {
            String accessToken = jwtService.generateAccessToken(request.getUsername());
            String refreshToken = jwtService.generateRefreshToken(request.getUsername());
            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        String username = jwtService.extractUsername(request.getRefreshToken());
        if (jwtService.isTokenValid(request.getRefreshToken(), username)) {
            String newAccessToken = jwtService.generateAccessToken(username);
            return ResponseEntity.ok(new AuthResponse(newAccessToken, request.getRefreshToken()));
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("User logged out successfully.");
    }
}