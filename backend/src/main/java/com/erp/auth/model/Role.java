package com.erp.auth.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum Role {
    SUPER_ADMIN("ROLE_SUPER_ADMIN", EnumSet.allOf(Permission.class)),
    ADMIN("ROLE_ADMIN", EnumSet.of(
            Permission.USER_MANAGE,
            Permission.USER_CREATE,
            Permission.USER_READ,
            Permission.USER_UPDATE,
            Permission.USER_DELETE,
            Permission.STUDENT_MANAGE,
            Permission.STUDENT_PROFILE_READ,
            Permission.STUDENT_PROFILE_UPDATE,
            Permission.ATTENDANCE_READ,
            Permission.FEES_READ,
            Permission.INSTITUTION_MANAGE,
            Permission.INSTITUTION_READ
    )),
    FACULTY("ROLE_FACULTY", EnumSet.of(
            Permission.ATTENDANCE_TAKE,
            Permission.ATTENDANCE_READ,
            Permission.ATTENDANCE_UPDATE,
            Permission.STUDENT_PROFILE_READ,
            Permission.INSTITUTION_READ
    )),
    STUDENT("ROLE_STUDENT", EnumSet.of(
            Permission.STUDENT_PROFILE_READ,
            Permission.STUDENT_ATTENDANCE_READ,
            Permission.STUDENT_FEES_READ
    )),
    PARENT("ROLE_PARENT", EnumSet.of(
            Permission.STUDENT_PROFILE_READ,
            Permission.STUDENT_ATTENDANCE_READ,
            Permission.STUDENT_FEES_READ
    )),
    FINANCE("ROLE_FINANCE", EnumSet.of(
            Permission.FEES_MANAGE,
            Permission.FEES_READ,
            Permission.FEES_CREATE,
            Permission.STUDENT_PROFILE_READ
    ));

    private final String authority;
    private final Set<Permission> permissions;

    Role(String authority, Set<Permission> permissions) {
        this.authority = authority;
        this.permissions = Collections.unmodifiableSet(permissions);
    }

    public String getAuthority() {
        return authority;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }
}

