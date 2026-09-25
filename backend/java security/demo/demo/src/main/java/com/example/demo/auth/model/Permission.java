package com.example.demo.auth.model;

public enum Permission {
    // Student Permissions
    STUDENT_PROFILE_READ("STUDENT_PROFILE_READ", "View Student Profile"),
    STUDENT_PROFILE_UPDATE("STUDENT_PROFILE_UPDATE", "Update Student Profile"),
    STUDENT_ATTENDANCE_READ("STUDENT_ATTENDANCE_READ", "View Student Attendance"),
    STUDENT_FEES_READ("STUDENT_FEES_READ", "View Student Fees"),

    // Faculty Permissions
    ATTENDANCE_TAKE("ATTENDANCE_TAKE", "Take Attendance"),
    ATTENDANCE_READ("ATTENDANCE_READ", "View Attendance Records"),
    ATTENDANCE_UPDATE("ATTENDANCE_UPDATE", "Modify Attendance Records"),

    // Admin Permissions
    USER_MANAGE("USER_MANAGE", "Manage Users"),
    USER_CREATE("USER_CREATE", "Create System User"),
    USER_READ("USER_READ", "View System Users"),
    USER_UPDATE("USER_UPDATE", "Update System User"),
    USER_DELETE("USER_DELETE", "Delete System User"),
    STUDENT_MANAGE("STUDENT_MANAGE", "Manage Students"),

    // Finance Permissions
    FEES_MANAGE("FEES_MANAGE", "Manage Fees"),
    FEES_READ("FEES_READ", "View Fee Records"),
    FEES_CREATE("FEES_CREATE", "Create Fee Invoices"),

    // Institution Permissions
    INSTITUTION_MANAGE("INSTITUTION_MANAGE", "Manage Institution Settings"),
    INSTITUTION_READ("INSTITUTION_READ", "View Institution Information");

    private final String value;
    private final String description;

    Permission(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }
}
