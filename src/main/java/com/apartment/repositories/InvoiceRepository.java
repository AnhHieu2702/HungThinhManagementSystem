package com.apartment.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Invoice;
import com.apartment.models.entities.enums.InvoiceStatus;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    
    List<Invoice> findByStatus(InvoiceStatus status);
    
    List<Invoice> findByApartmentId(UUID apartmentId);
    
    List<Invoice> findByMonthAndYear(Integer month, Integer year);
    
    List<Invoice> findByStatusAndMonth(InvoiceStatus status, Integer month);
    
    List<Invoice> findByStatusAndYear(InvoiceStatus status, Integer year);
    
    List<Invoice> findByStatusAndMonthAndYear(InvoiceStatus status, Integer month, Integer year);
    
    Optional<Invoice> findByApartmentIdAndMonthAndYear(UUID apartmentId, Integer month, Integer year);
    
    List<Invoice> findByApartmentApartmentNumber(String apartmentNumber);
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}