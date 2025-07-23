package com.apartment.models.entities.enums;

public enum VoteStatus {
    DRAFT("Nháp"),
    ACTIVE("Đang diễn ra"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy");

    private final String displayName;

    VoteStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
