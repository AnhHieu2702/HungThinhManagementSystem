package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.util.List;

import com.apartment.models.entities.enums.VoteStatus;
import com.apartment.models.entities.enums.VoteType;

@Entity
@Table(name = "votes")
@Data
@EqualsAndHashCode(callSuper = true)
public class Vote extends BaseEntity {
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false)
    private VoteType voteType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VoteStatus status = VoteStatus.ACTIVE;
    
    @OneToMany(mappedBy = "vote", cascade = CascadeType.ALL)
    private List<VoteOption> options;
    
    @OneToMany(mappedBy = "vote", cascade = CascadeType.ALL)
    private List<VoteRecord> voteRecords;
}