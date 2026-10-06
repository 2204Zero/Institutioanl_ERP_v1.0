package com.example.demo.security.breaking;

import com.example.demo.common.exception.ApiException;
import com.example.demo.recovery.dto.ResetPasswordRequest;
import com.example.demo.recovery.entity.PasswordResetToken;
import com.example.demo.recovery.repository.PasswordResetTokenRepository;
import com.example.demo.recovery.service.PasswordRecoveryService;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

public class AccountRecoveryBreakingTest {

    private PasswordRecoveryService passwordRecoveryService;
    private UserRepository userRepository;
    private PasswordResetTokenRepository tokenRepository;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    public void setup() {
        userRepository = Mockito.mock(UserRepository.class);
        tokenRepository = Mockito.mock(PasswordResetTokenRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        passwordRecoveryService = new PasswordRecoveryService(userRepository, tokenRepository, passwordEncoder);
    }

    @Test
    public void testTokenReplayAttack() {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("my-token");
        token.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        token.setUsed(true); // SIMULATING REPLAY (already used)
        
        when(tokenRepository.findByToken("my-token")).thenReturn(Optional.of(token));

        ResetPasswordRequest request = new ResetPasswordRequest("my-token", "newPassword123");

        assertThrows(ApiException.class, () -> {
            passwordRecoveryService.resetPassword(request);
        });
    }

    @Test
    public void testExpiredResetToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("my-token");
        token.setExpiresAt(LocalDateTime.now().minusMinutes(5));
        token.setUsed(false);

        when(tokenRepository.findByToken("my-token")).thenReturn(Optional.of(token));

        ResetPasswordRequest request = new ResetPasswordRequest("my-token", "newPassword123");

        assertThrows(ApiException.class, () -> {
            passwordRecoveryService.resetPassword(request);
        });
    }

    @Test
    public void testBruteForceTamperedResetCode() {
        when(tokenRepository.findByToken("invalid-random-token")).thenReturn(Optional.empty());

        ResetPasswordRequest request = new ResetPasswordRequest("invalid-random-token", "newPassword123");

        assertThrows(ApiException.class, () -> {
            passwordRecoveryService.resetPassword(request);
        });
    }
}
