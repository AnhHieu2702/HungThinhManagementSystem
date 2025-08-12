package com.apartment.services.implement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.invoices.InvoiceBulkCreateRequest;
import com.apartment.models.dtos.invoices.InvoiceCreateRequest;
import com.apartment.models.dtos.invoices.InvoiceGetsResponse;
import com.apartment.models.dtos.invoices.InvoiceUpdateRequest;
import com.apartment.models.entities.bases.Apartment;
import com.apartment.models.entities.bases.Invoice;
import com.apartment.models.entities.enums.InvoiceStatus;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.ApartmentRepository;
import com.apartment.repositories.InvoiceRepository;
import com.apartment.services.interfaces.IInvoiceService;

import org.springframework.stereotype.Service;

@Service
public class InvoiceService implements IInvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
            ApartmentRepository apartmentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    public ApiResult<UUID> createInvoice(InvoiceCreateRequest apiRequest) {
        Apartment apartment = apartmentRepository.findByApartmentNumber(apiRequest.getApartmentNumber())
                .orElseThrow(() -> new UserMessageException("Căn hộ không tồn tại"));

        // Kiểm tra hóa đơn đã tồn tại cho tháng/năm này chưa
        invoiceRepository.findByApartmentIdAndMonthAndYear(apartment.getId(),
                apiRequest.getMonth(), apiRequest.getYear())
                .ifPresent(existingInvoice -> {
                    throw new UserMessageException("Hóa đơn cho căn hộ " +
                            apiRequest.getApartmentNumber() + " tháng " +
                            apiRequest.getMonth() + "/" + apiRequest.getYear() + " đã tồn tại");
                });

        Invoice newInvoice = new Invoice();
        newInvoice.setInvoiceNumber(generateInvoiceNumber(apartment.getApartmentNumber(),
                apiRequest.getMonth(), apiRequest.getYear()));
        newInvoice.setApartment(apartment);
        newInvoice.setMonth(apiRequest.getMonth());
        newInvoice.setYear(apiRequest.getYear());
        newInvoice.setManagementFee(apiRequest.getManagementFee());
        newInvoice.setWaterFee(apiRequest.getWaterFee());
        newInvoice.setElectricityFee(apiRequest.getElectricityFee());
        newInvoice.setParkingFee(apiRequest.getParkingFee());
        newInvoice.setOtherFee(apiRequest.getOtherFee());

        // Tính tổng tiền
        BigDecimal totalAmount = apiRequest.getManagementFee()
                .add(apiRequest.getWaterFee())
                .add(apiRequest.getElectricityFee())
                .add(apiRequest.getParkingFee())
                .add(apiRequest.getOtherFee());
        newInvoice.setTotalAmount(totalAmount);

        newInvoice.setDueDate(apiRequest.getDueDate() != null ? apiRequest.getDueDate() : LocalDate.now().plusDays(30));
        newInvoice.setStatus(InvoiceStatus.PENDING);

        invoiceRepository.save(newInvoice);

        return ApiResult.success(newInvoice.getId(), "Tạo hóa đơn thành công");
    }

    @Override
    public ApiResult<String> createBulkInvoices(InvoiceBulkCreateRequest apiRequest) {
        List<Apartment> apartments = apartmentRepository.findAll();

        if (apartments.isEmpty()) {
            throw new UserMessageException("Không có căn hộ nào trong hệ thống");
        }

        int createdCount = 0;
        int skippedCount = 0;

        for (Apartment apartment : apartments) {
            // Kiểm tra hóa đơn đã tồn tại chưa
            if (invoiceRepository.findByApartmentIdAndMonthAndYear(apartment.getId(),
                    apiRequest.getMonth(), apiRequest.getYear()).isPresent()) {
                skippedCount++;
                continue;
            }

            Invoice newInvoice = new Invoice();
            newInvoice.setInvoiceNumber(generateInvoiceNumber(apartment.getApartmentNumber(),
                    apiRequest.getMonth(), apiRequest.getYear()));
            newInvoice.setApartment(apartment);
            newInvoice.setMonth(apiRequest.getMonth());
            newInvoice.setYear(apiRequest.getYear());
            newInvoice.setManagementFee(apiRequest.getManagementFee());
            newInvoice.setWaterFee(apiRequest.getWaterFee());
            newInvoice.setElectricityFee(apiRequest.getElectricityFee());
            newInvoice.setParkingFee(apiRequest.getParkingFee());
            newInvoice.setOtherFee(apiRequest.getOtherFee());

            // Tính tổng tiền
            BigDecimal totalAmount = apiRequest.getManagementFee()
                    .add(apiRequest.getWaterFee())
                    .add(apiRequest.getElectricityFee())
                    .add(apiRequest.getParkingFee())
                    .add(apiRequest.getOtherFee());
            newInvoice.setTotalAmount(totalAmount);

            newInvoice.setDueDate(
                    apiRequest.getDueDate() != null ? apiRequest.getDueDate() : LocalDate.now().plusDays(30));
            newInvoice.setStatus(InvoiceStatus.PENDING);

            invoiceRepository.save(newInvoice);
            createdCount++;
        }

        return ApiResult.success(null, String.format("Tạo hóa đơn hàng loạt thành công. " +
                "Đã tạo: %d, Bỏ qua: %d", createdCount, skippedCount));
    }

    @Override
    public ApiResult<String> updateInvoice(UUID invoiceId, InvoiceUpdateRequest apiRequest) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new UserMessageException("Hóa đơn không tồn tại"));

        if (apiRequest.getManagementFee() != null) {
            invoice.setManagementFee(apiRequest.getManagementFee());
        }
        if (apiRequest.getWaterFee() != null) {
            invoice.setWaterFee(apiRequest.getWaterFee());
        }
        if (apiRequest.getElectricityFee() != null) {
            invoice.setElectricityFee(apiRequest.getElectricityFee());
        }
        if (apiRequest.getParkingFee() != null) {
            invoice.setParkingFee(apiRequest.getParkingFee());
        }
        if (apiRequest.getOtherFee() != null) {
            invoice.setOtherFee(apiRequest.getOtherFee());
        }
        if (apiRequest.getDueDate() != null) {
            invoice.setDueDate(apiRequest.getDueDate());
        }
        if (apiRequest.getStatus() != null) {
            invoice.setStatus(InvoiceStatus.valueOf(apiRequest.getStatus()));
        }

        // Tính lại tổng tiền
        BigDecimal totalAmount = invoice.getManagementFee()
                .add(invoice.getWaterFee())
                .add(invoice.getElectricityFee())
                .add(invoice.getParkingFee())
                .add(invoice.getOtherFee());
        invoice.setTotalAmount(totalAmount);

        invoiceRepository.save(invoice);
        return ApiResult.success(null, "Cập nhật hóa đơn thành công");
    }

    @Override
    public ApiResult<List<InvoiceGetsResponse>> getInvoicesWithFilter(String status, Integer month, Integer year) {
        List<Invoice> invoices;

        // Xử lý logic filter theo từng case
        if (status != null && month != null && year != null) {
            // Có cả 3 tham số
            InvoiceStatus invoiceStatus = parseInvoiceStatus(status);
            invoices = invoiceRepository.findByStatusAndMonthAndYear(invoiceStatus, month, year);
        } else if (status != null && month != null) {
            // Có status và month
            InvoiceStatus invoiceStatus = parseInvoiceStatus(status);
            invoices = invoiceRepository.findByStatusAndMonth(invoiceStatus, month);
        } else if (status != null && year != null) {
            // Có status và year
            InvoiceStatus invoiceStatus = parseInvoiceStatus(status);
            invoices = invoiceRepository.findByStatusAndYear(invoiceStatus, year);
        } else if (month != null && year != null) {
            // Có month và year
            invoices = invoiceRepository.findByMonthAndYear(month, year);
        } else if (status != null) {
            // Chỉ có status
            InvoiceStatus invoiceStatus = parseInvoiceStatus(status);
            invoices = invoiceRepository.findByStatus(invoiceStatus);
        } else {
            // Không có filter nào, lấy tất cả
            invoices = invoiceRepository.findAll();
        }

        List<InvoiceGetsResponse> responseList = invoices.stream()
                .map(this::mapToInvoiceResponse)
                .toList();

        String message = buildFilterMessage(status, month, year);
        return ApiResult.success(responseList, message);
    }

    @Override
    public ApiResult<List<InvoiceGetsResponse>> getInvoicesByApartment(String apartmentNumber) {
        List<Invoice> invoices = invoiceRepository.findByApartmentApartmentNumber(apartmentNumber);
        List<InvoiceGetsResponse> responseList = invoices.stream()
                .map(this::mapToInvoiceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách hóa đơn theo căn hộ thành công");
    }

    private InvoiceStatus parseInvoiceStatus(String status) {
        try {
            return InvoiceStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new UserMessageException("Trạng thái hóa đơn không hợp lệ: " + status);
        }
    }

    private InvoiceGetsResponse mapToInvoiceResponse(Invoice invoice) {
        return new InvoiceGetsResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getApartment().getApartmentNumber(),
                invoice.getApartment().getOwner() != null ? invoice.getApartment().getOwner().getUsername() : "",
                invoice.getMonth(),
                invoice.getYear(),
                invoice.getManagementFee(),
                invoice.getWaterFee(),
                invoice.getElectricityFee(),
                invoice.getParkingFee(),
                invoice.getOtherFee(),
                invoice.getTotalAmount(),
                invoice.getDueDate(),
                invoice.getStatus().getDisplayName());
    }

    private String generateInvoiceNumber(String apartmentNumber, Integer month, Integer year) {
        return String.format("HD%s%02d%d", apartmentNumber, month, year);
    }

    private String buildFilterMessage(String status, Integer month, Integer year) {
        StringBuilder message = new StringBuilder("Lấy danh sách hóa đơn");

        if (status != null || month != null || year != null) {
            message.append(" với bộ lọc:");
            if (status != null)
                message.append(" trạng thái = ").append(status);
            if (month != null && year != null) {
                message.append(" thời gian = ").append(month).append("/").append(year);
            } else if (month != null) {
                message.append(" tháng = ").append(month);
            } else if (year != null) {
                message.append(" năm = ").append(year);
            }
        }

        message.append(" thành công");
        return message.toString();
    }
}