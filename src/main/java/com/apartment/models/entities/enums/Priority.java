package com.apartment.models.entities.enums;

public enum Priority {
    NORMAL("Bình thường"),
    HIGH("Quan trọng"),
    URGENT("Khẩn cấp");

    private final String displayName;

    Priority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}