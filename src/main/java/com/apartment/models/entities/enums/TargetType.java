package com.apartment.models.entities.enums;

public enum TargetType {
    ALL("Toàn bộ"),
    FLOOR("Theo tầng"),
    BLOCK("Theo block"),
    APARTMENT("Căn hộ cụ thể");

    private final String displayName;

    TargetType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}