package com.example.demo.user.service.impl;

import com.example.demo.common.exception.ApiException;
import com.example.demo.common.exception.ResourceNotFoundException;
import com.example.demo.user.dto.UserCreateRequest;
import com.example.demo.user.dto.UserResponse;
import com.example.demo.user.dto.UserUpdateRequest;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import com.example.demo.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        log.info("Attempting to create user with username: {}", request.username());
        
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException("USER_EXISTS", "Username already exists", HttpStatus.CONFLICT.value());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException("EMAIL_EXISTS", "Email already exists", HttpStatus.CONFLICT.value());
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        
        User savedUser = userRepository.save(user);
        log.info("Successfully created user with id: {}", savedUser.getId());
        
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (request.username() != null && !request.username().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.username())) {
                throw new ApiException("USER_EXISTS", "Username already exists", HttpStatus.CONFLICT.value());
            }
            user.setUsername(request.username());
        }
        
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new ApiException("EMAIL_EXISTS", "Email already exists", HttpStatus.CONFLICT.value());
            }
            user.setEmail(request.email());
        }
        
        if (request.status() != null) {
            user.setStatus(request.status());
        }

        User updatedUser = userRepository.save(user);
        log.info("Successfully updated user with id: {}", updatedUser.getId());
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changeUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setStatus(status);
        userRepository.save(user);
        log.info("User {} status changed to {}", id, status);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String status, Pageable pageable) {
        Page<User> users;
        if (status != null && !status.isBlank()) {
            users = userRepository.findByStatus(status, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::mapToResponse);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus(),
                user.getRoles(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
