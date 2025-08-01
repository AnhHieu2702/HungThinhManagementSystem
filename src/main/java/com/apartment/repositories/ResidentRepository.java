package com.apartment.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import com.apartment.models.entities.bases.Resident;
import com.apartment.models.entities.enums.RelationshipType;

public interface ResidentRepository extends JpaRepository<Resident, UUID> {
    List<Resident> findByApartmentId(UUID apartmentId);

    List<Resident> findByRelationship(RelationshipType relationship);
}
