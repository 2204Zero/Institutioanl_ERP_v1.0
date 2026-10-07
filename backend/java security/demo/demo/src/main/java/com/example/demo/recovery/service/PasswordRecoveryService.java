package com.example.demo.recovery.service;

import com.example.demo.common.exception.ApiException;
import com.example.demo.common.exception.ResourceNotFoundException;
import com.example.demo.recovery.dto.ChangePasswordRequest;
import com.example.demo.recovery.dto.ResetPasswordRequest;
import com.example.demo.recovery.entity.PasswordResetToken;
import com.example.demo.recovery.repository.PasswordResetTokenRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordRecoveryService {

    private static final Logger log = LoggerFactory.getLogger(PasswordRecoveryService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordRecoveryService(UserRepository userRepository, 
                                   PasswordResetTokenRepository tokenRepository, 
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new ApiException("INVALID_CREDENTIALS", "Old password does not match", HttpStatus.BAD_REQUEST.value());
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", username);
    }

    @Transactional
    public void generateForgotPasswordToken(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            token.setToken(UUID.randomUUID().toString());
            token.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // 15 min expiry
            tokenRepository.save(token);
            
            // In a real app, send email with this token here.
            log.info("Generated password reset token for user {}: {}", user.getUsername(), token.getToken());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new ApiException("INVALID_TOKEN", "Token is invalid or expired", HttpStatus.BAD_REQUEST.value()));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("INVALID_TOKEN", "Token is invalid or expired", HttpStatus.BAD_REQUEST.value());
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getUsername());
    }
}
