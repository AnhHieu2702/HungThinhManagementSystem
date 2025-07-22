package com.apartment.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Resident;

public interface ResidentRepository extends JpaRepository<Resident, UUID> {

}
