package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.apartment.models.entities.enums.InvoiceStatus;

@Entity
@Table(name = "invoices")
@Data
@EqualsAndHashCode(callSuper = true)
public class Invoice extends BaseEntity {
    
    @Column(name = "invoice_number", unique = true, nullable = false, length = 50)
    private String invoiceNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;
    
    @Column(name = "month", nullable = false)
    private Integer month;
    
    @Column(name = "year", nullable = false)
    private Integer year;
    
    @Column(name = "management_fee", precision = 15, scale = 2)
    private BigDecimal managementFee = BigDecimal.ZERO;
    
    @Column(name = "water_fee", precision = 15, scale = 2)
    private BigDecimal waterFee = BigDecimal.ZERO;
    
    @Column(name = "electricity_fee", precision = 15, scale = 2)
    private BigDecimal electricityFee = BigDecimal.ZERO;
    
    @Column(name = "parking_fee", precision = 15, scale = 2)
    private BigDecimal parkingFee = BigDecimal.ZERO;
    
    @Column(name = "other_fee", precision = 15, scale = 2)
    private BigDecimal otherFee = BigDecimal.ZERO;
    
    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvoiceStatus status = InvoiceStatus.PENDING;
}