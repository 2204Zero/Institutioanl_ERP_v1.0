package com.example.demo.auth.model;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryUserRegistry implements UserDetailsService {

    private final Map<String, UserPrincipal> users = new ConcurrentHashMap<>();

    public InMemoryUserRegistry(PasswordEncoder passwordEncoder) {
        // Pre-configure enterprise users representing the required ERP roles
        register(UserPrincipal.of("superadmin", passwordEncoder.encode("Admin@123"), "superadmin@erp.com", Role.SUPER_ADMIN));
        register(UserPrincipal.of("admin", passwordEncoder.encode("Admin@123"), "admin@erp.com", Role.ADMIN));
        register(UserPrincipal.of("faculty", passwordEncoder.encode("Faculty@123"), "faculty@erp.com", Role.FACULTY));
        register(UserPrincipal.of("student", passwordEncoder.encode("Student@123"), "student@erp.com", Role.STUDENT));
        register(UserPrincipal.of("parent", passwordEncoder.encode("Parent@123"), "parent@erp.com", Role.PARENT));
        register(UserPrincipal.of("finance", passwordEncoder.encode("Finance@123"), "finance@erp.com", Role.FINANCE));

        // Backward compatibility for Day 1 credentials
        register(UserPrincipal.of("user", passwordEncoder.encode("password"), "user@erp.com", Role.STUDENT));
    }

    public void register(UserPrincipal user) {
        users.put(user.getUsername().toLowerCase(), user);
    }

    public boolean userExists(String username) {
        return username != null && users.containsKey(username.toLowerCase());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null) {
            throw new UsernameNotFoundException("Username cannot be null");
        }
        UserPrincipal user = users.get(username.toLowerCase());
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return user;
    }

    public UserPrincipal findByUsername(String username) {
        if (username == null) {
            return null;
        }
        return users.get(username.toLowerCase());
    }
}
