package com.apartment.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apartment.models.entities.bases.Resident;

public interface ResidentRepository extends JpaRepository<Resident, UUID> {
    List<Resident> findByApartmentId(UUID apartmentId);
}
