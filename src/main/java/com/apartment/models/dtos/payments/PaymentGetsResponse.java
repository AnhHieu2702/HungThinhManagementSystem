package com.apartment.models.dtos.payments;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentGetsResponse {
    private UUID id;
    private String paymentCode;
    private String invoiceNumber;
    private String apartmentNumber;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private String transactionId;
    private String notes;
}