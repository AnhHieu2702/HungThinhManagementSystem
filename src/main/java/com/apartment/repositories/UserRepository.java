package com.apartment.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByUsername(String username);
}
