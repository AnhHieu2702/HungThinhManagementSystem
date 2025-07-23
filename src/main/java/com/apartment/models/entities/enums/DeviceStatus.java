package com.apartment.models.entities.enums;

public enum DeviceStatus {
    ACTIVE("Hoạt động"),
    INACTIVE("Không hoạt động"),
    UNDER_MAINTENANCE("Đang bảo trì"),
    BROKEN("Hỏng");

    private final String displayName;

    DeviceStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}