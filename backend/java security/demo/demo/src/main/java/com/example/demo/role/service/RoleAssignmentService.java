package com.example.demo.role.service;

import com.example.demo.common.exception.ResourceNotFoundException;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(RoleAssignmentService.class);
    private final UserRepository userRepository;

    public RoleAssignmentService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void assignRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        // Ensure role format (e.g., prefix with ROLE_ if required by spring security)
        String roleToAssign = roleName.toUpperCase();
        if (!roleToAssign.startsWith("ROLE_")) {
            roleToAssign = "ROLE_" + roleToAssign;
        }

        if (user.getRoles().add(roleToAssign)) {
            userRepository.save(user);
            log.info("Role {} assigned to user {}", roleToAssign, userId);
        } else {
            log.info("User {} already has role {}", userId, roleToAssign);
        }
    }

    @Transactional
    public void removeRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        String roleToRemove = roleName.toUpperCase();
        if (!roleToRemove.startsWith("ROLE_")) {
            roleToRemove = "ROLE_" + roleToRemove;
        }

        if (user.getRoles().remove(roleToRemove)) {
            userRepository.save(user);
            log.info("Role {} removed from user {}", roleToRemove, userId);
        } else {
            log.info("User {} did not have role {}", userId, roleToRemove);
        }
    }
}
