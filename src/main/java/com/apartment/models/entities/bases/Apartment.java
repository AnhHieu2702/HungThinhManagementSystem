package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

import com.apartment.models.entities.enums.ApartmentStatus;

@Entity
@Table(name = "apartments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Apartment extends BaseEntity {

    @Column(name = "apartment_number", nullable = false, length = 20, unique = true)
    private String apartmentNumber;

    @Column(name = "floor", nullable = false)
    private Integer floor;

    @Column(name = "block", length = 10)
    private String block;

    @Column(name = "area", precision = 8, scale = 2)
    private BigDecimal area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApartmentStatus status = ApartmentStatus.OCCUPIED;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL)
    private List<Resident> residents;
}