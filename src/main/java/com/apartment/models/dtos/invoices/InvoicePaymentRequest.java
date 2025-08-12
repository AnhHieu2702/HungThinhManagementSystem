package com.apartment.models.dtos.invoices;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InvoicePaymentRequest {
    @NotNull(message = "Vui lòng nhập số tiền thanh toán")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotBlank(message = "Vui lòng chọn phương thức thanh toán")
    private String paymentMethod; // QR_CODE, E_WALLET, BANK_TRANSFER

    private String transactionId; // Mã giao dịch từ bên thứ 3

    private String notes;
}