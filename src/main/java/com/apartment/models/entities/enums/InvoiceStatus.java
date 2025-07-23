package com.apartment.models.entities.enums;
    
public enum InvoiceStatus {
    PENDING("Chờ thanh toán"),
    PAID("Đã thanh toán"),
    OVERDUE("Quá hạn"),
    CANCELLED("Đã hủy");

    private final String displayName;

    InvoiceStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}