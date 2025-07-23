package com.apartment.models.entities.enums;

public enum VoteType {
    YES_NO("Có / Không"),
    MULTIPLE_CHOICE("Nhiều lựa chọn"),
    SINGLE_CHOICE("Một lựa chọn");

    private final String displayName;

    VoteType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
