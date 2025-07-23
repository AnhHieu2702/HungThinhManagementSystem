package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "vote_options")
@Data
@EqualsAndHashCode(callSuper = true)
public class VoteOption extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private Vote vote;
    
    @Column(name = "option_text", nullable = false, length = 500)
    private String optionText;
    
    @Column(name = "display_order")
    private Integer displayOrder;
}
