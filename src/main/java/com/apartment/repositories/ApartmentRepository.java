package com.apartment.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Apartment;

public interface ApartmentRepository extends JpaRepository<Apartment, UUID> {
}
