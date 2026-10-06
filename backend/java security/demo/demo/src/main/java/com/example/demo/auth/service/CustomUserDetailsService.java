package com.example.demo.auth.service;

import com.example.demo.auth.model.Role;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<GrantedAuthority> authorities = new ArrayList<>();
        for (String roleStr : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(roleStr));
            try {
                String enumName = roleStr.startsWith("ROLE_") ? roleStr.substring(5) : roleStr;
                Role roleEnum = Role.valueOf(enumName);
                roleEnum.getPermissions().forEach(permission -> 
                    authorities.add(new SimpleGrantedAuthority(permission.getValue()))
                );
            } catch (IllegalArgumentException ignored) {
                // Ignore unknown roles mapping
            }
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .disabled(!"ACTIVE".equals(user.getStatus()))
                .authorities(authorities)
                .build();
    }
}

