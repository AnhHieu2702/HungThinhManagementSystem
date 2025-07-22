package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

import com.apartment.models.entities.enums.RelationshipType;

@Entity
@Table(name = "residents")
@Data
@EqualsAndHashCode(callSuper = true)
public class Resident extends BaseEntity {
    
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "id_card", length = 20)
    private String idCard;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship", nullable = false)
    private RelationshipType relationship; // Chủ hộ, Vợ/Chồng, Con, Bố/Mẹ, Người thuê...
    
    @Column(name = "is_temporary", nullable = false)
    private Boolean isTemporary = false;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}