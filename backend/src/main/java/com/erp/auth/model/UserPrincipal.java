package com.erp.auth.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final String email;
    private final Role role;
    private final Set<Permission> permissions;
    private final boolean enabled;

    public UserPrincipal(Long id, String username, String password, String email, Role role, Set<Permission> permissions, boolean enabled) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.permissions = permissions != null ? permissions : role.getPermissions();
        this.enabled = enabled;
    }

    public UserPrincipal(String username, String password, String email, Role role, Set<Permission> permissions, boolean enabled) {
        this(null, username, password, email, role, permissions, enabled);
    }

    public static UserPrincipal of(String username, String encodedPassword, String email, Role role) {
        return new UserPrincipal(null, username, encodedPassword, email, role, role.getPermissions(), true);
    }

    public Long getId() {
        return id;
    }

    public Role getRole() {
        return role;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        // Add Role authority (e.g., ROLE_STUDENT)
        authorities.add(new SimpleGrantedAuthority(role.getAuthority()));
        // Add individual Permission authorities (e.g., STUDENT_PROFILE_READ)
        for (Permission permission : permissions) {
            authorities.add(new SimpleGrantedAuthority(permission.getValue()));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}

