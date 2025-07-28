package com.apartment.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.VoteOption;

public interface VoteOptionRepository extends JpaRepository<VoteOption, UUID> {
    
    List<VoteOption> findByVoteIdOrderByDisplayOrder(UUID voteId);
    
    List<VoteOption> findByVoteId(UUID voteId);
    
    List<VoteOption> findByVoteIdAndDisplayOrder(UUID voteId, Integer displayOrder);
    
    void deleteByVoteId(UUID voteId);

    Optional<VoteOption> findByVoteIdAndOptionText(UUID voteId, String optionText);
}