package com.apartment.models.entities.enums;

public enum FeedbackStatus {
    PENDING("Chờ xử lý"),
    IN_PROGRESS("Đang xử lý"),
    RESOLVED("Đã xử lý"),
    CLOSED("Đã đóng");

    private final String displayName;

    FeedbackStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}