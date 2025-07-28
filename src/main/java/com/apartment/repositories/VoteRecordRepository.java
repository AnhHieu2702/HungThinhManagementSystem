package com.apartment.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.VoteRecord;

public interface VoteRecordRepository extends JpaRepository<VoteRecord, UUID> {
    
    List<VoteRecord> findByVoteId(UUID voteId);
    
    List<VoteRecord> findByVoterId(UUID voterId);
    
    Optional<VoteRecord> findByVoteIdAndVoterId(UUID voteId, UUID voterId);
    
    List<VoteRecord> findByApartmentId(UUID apartmentId);
    
    List<VoteRecord> findByVoteIdAndApartmentId(UUID voteId, UUID apartmentId);
    
    List<VoteRecord> findBySelectedOptionId(UUID selectedOptionId);
    
    List<VoteRecord> findByVoteIdAndVoteValue(UUID voteId, String voteValue);
    
    List<VoteRecord> findByVoteIdAndVoteValueNotNull(UUID voteId); // Method đơn giản hơn
    
    Integer countByVoteId(UUID voteId);
    
    Integer countBySelectedOptionId(UUID selectedOptionId);
    
    Integer countByVoteIdAndVoteValue(UUID voteId, String voteValue);
    
    Boolean existsByVoteIdAndVoterId(UUID voteId, UUID voterId);
}