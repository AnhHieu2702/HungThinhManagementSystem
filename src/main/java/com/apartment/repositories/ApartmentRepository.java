package com.apartment.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Apartment;

public interface ApartmentRepository extends JpaRepository<Apartment, UUID> {
    Optional<Apartment> findByApartmentNumber(String apartmentNumber);

    boolean existsByApartmentNumber(String apartmentNumber);

    Optional<Apartment> findByOwnerId(UUID ownerId);
}