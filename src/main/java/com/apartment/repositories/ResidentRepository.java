package com.apartment.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.apartment.models.entities.bases.Resident;
import com.apartment.models.entities.enums.RelationshipType;

public interface ResidentRepository extends JpaRepository<Resident, UUID> {
    List<Resident> findByApartmentId(UUID apartmentId);

    List<Resident> findByRelationship(RelationshipType relationship);

    @Query("SELECT r FROM Resident r " +
           "JOIN FETCH r.apartment a " +
           "WHERE a.owner.id = :ownerId " +
           "AND r.relationship = :relationship")
    Optional<Resident> findOwnerInfoByUserId(@Param("ownerId") UUID ownerId, 
                                           @Param("relationship") RelationshipType relationship);
}
