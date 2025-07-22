package com.apartment.models.entities.enums;

public enum ApartmentStatus {
    OCCUPIED("Đang ở"),
    VACANT("Trống"),
    UNDER_MAINTENANCE("Bảo trì");

    private final String displayName;

    ApartmentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}