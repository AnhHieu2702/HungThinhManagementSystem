package com.apartment.models.entities.enums;

public enum RelationshipType {
    OWNER("Chủ hộ"),
    SPOUSE("Vợ / Chồng"),
    CHILD("Con"),
    PARENT("Cha / Mẹ"),
    RELATIVE("Người thân"),
    TENANT("Người thuê");

    private final String displayName;

    RelationshipType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
