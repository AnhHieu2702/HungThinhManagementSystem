package com.apartment.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Vote;
import com.apartment.models.entities.enums.VoteStatus;

public interface VoteRepository extends JpaRepository<Vote, UUID> {
    
    List<Vote> findByStatus(VoteStatus status);
    
    List<Vote> findByCreatedById(UUID createdById);
    
    List<Vote> findByStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatus(
        LocalDateTime startTime, LocalDateTime endTime, VoteStatus status);
    
    List<Vote> findByEndDateBeforeAndStatus(LocalDateTime now, VoteStatus status);
}