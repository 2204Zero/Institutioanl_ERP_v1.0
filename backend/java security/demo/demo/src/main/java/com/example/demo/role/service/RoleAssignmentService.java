package com.example.demo.role.service;

import com.example.demo.audit.Auditable;
import com.example.demo.common.exception.ResourceNotFoundException;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    @Auditable(action = "ASSIGN_ROLE", resource = "USER", resourceIdParam = "userId")
    public void assignRole(Long userId, String roleName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to assign roles.");
        }
        
        String currentUser = auth.getName();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                
        if (user.getUsername().equals(currentUser)) {
            throw new AccessDeniedException("Self-assignment of roles is strictly prohibited.");
        }
        
        String roleToAssign = roleName.toUpperCase();
        if (!roleToAssign.startsWith("ROLE_")) {
            roleToAssign = "ROLE_" + roleToAssign;
        }

        if (roleToAssign.equals("ROLE_SUPER_ADMIN")) {
            boolean isSuperAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isSuperAdmin) {
                throw new AccessDeniedException("Only a SUPER_ADMIN can assign the SUPER_ADMIN role.");
            }
        }

        if (user.getRoles().add(roleToAssign)) {
            userRepository.save(user);
            log.info("Role {} assigned to user {} by {}", roleToAssign, userId, currentUser);
        } else {
            log.info("User {} already has role {}", userId, roleToAssign);
        }
    }

    @Transactional
    @Auditable(action = "REMOVE_ROLE", resource = "USER", resourceIdParam = "userId")
    public void removeRole(Long userId, String roleName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to remove roles.");
        }
        
        String currentUser = auth.getName();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                
        if (user.getUsername().equals(currentUser)) {
            throw new AccessDeniedException("Self-removal of roles is strictly prohibited.");
        }
        
        String roleToRemove = roleName.toUpperCase();
        if (!roleToRemove.startsWith("ROLE_")) {
            roleToRemove = "ROLE_" + roleToRemove;
        }

        if (roleToRemove.equals("ROLE_SUPER_ADMIN")) {
            boolean isSuperAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isSuperAdmin) {
                throw new AccessDeniedException("Only a SUPER_ADMIN can remove the SUPER_ADMIN role.");
            }
        }

        if (user.getRoles().remove(roleToRemove)) {
            userRepository.save(user);
            log.info("Role {} removed from user {} by {}", roleToRemove, userId, currentUser);
        } else {
            log.info("User {} did not have role {}", userId, roleToRemove);
        }
    }
}
