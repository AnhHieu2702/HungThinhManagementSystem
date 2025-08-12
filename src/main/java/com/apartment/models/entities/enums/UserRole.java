package com.apartment.models.entities.enums;

public enum UserRole {
    ADMIN("Quản trị viên"),
    MANAGER("Quản lý"),
    RESIDENT("Cư dân"),
    ACCOUNTANT("Kế toán"),
    TECHNICIAN("Kỹ thuật viên");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}