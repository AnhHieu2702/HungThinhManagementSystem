package com.apartment.services.implement;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.events.EventCreateRequest;
import com.apartment.models.dtos.events.EventGetResponse;
import com.apartment.models.dtos.events.EventGetsResponse;
import com.apartment.models.dtos.events.EventRegistrationRequest;
import com.apartment.models.entities.bases.Apartment;
import com.apartment.models.entities.bases.Event;
import com.apartment.models.entities.bases.Resident;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.enums.UserRole;
import com.apartment.models.global.ApiResult;
import com.apartment.models.security.UserPrincipal;
import com.apartment.repositories.ApartmentRepository;
import com.apartment.repositories.EventRepository;
import com.apartment.repositories.ResidentRepository;
import com.apartment.repositories.UserRepository;
import com.apartment.services.interfaces.IEventService;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class EventService implements IEventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ResidentRepository residentRepository;
    private final ApartmentRepository apartmentRepository;

    public EventService(EventRepository eventRepository,
            UserRepository userRepository,
            ResidentRepository residentRepository,
            ApartmentRepository apartmentRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.residentRepository = residentRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    public ApiResult<String> createEvent(Authentication auth, EventCreateRequest apiRequest) {
        UUID userId = getUserIdFromAuthentication(auth);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        Event event = Event.builder()
                .title(apiRequest.getTitle())
                .description(apiRequest.getDescription())
                .startTime(apiRequest.getStartTime())
                .endTime(apiRequest.getEndTime())
                .location(apiRequest.getLocation())
                .eventType(apiRequest.getEventType())
                .isPublic(true) // Mặc định là công khai
                .createdBy(user)
                .build();

        eventRepository.save(event);
        return ApiResult.success(null, "Tạo sự kiện thành công");
    }

    @Override
    public ApiResult<List<EventGetsResponse>> getUpcomingEvents() {
        List<Event> events = eventRepository.findAll();
        List<EventGetsResponse> responseList = events.stream()
                .map(this::mapToEventResponse)
                .toList();
        return ApiResult.success(responseList, "Lấy danh sách sự kiện sắp tới thành công");
    }

    @Override
    public ApiResult<String> registerForEvent(EventRegistrationRequest apiRequest, String currentUsername) {
        // Kiểm tra user tồn tại
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

        // Kiểm tra user có phải là RESIDENT không
        if (!UserRole.RESIDENT.equals(user.getRole())) {
            throw new UserMessageException("Chỉ cư dân mới có thể đăng ký sự kiện");
        }

        // Tìm apartment thuộc về user này (user là owner)
        List<Apartment> apartments = apartmentRepository.findAll();
        Apartment userApartment = apartments.stream()
                .filter(apt -> apt.getOwner() != null && apt.getOwner().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new UserMessageException("Không tìm thấy căn hộ của người dùng này"));

        // Tìm resident thuộc apartment này
        List<Resident> allResidents = residentRepository.findAll();
        Resident resident = allResidents.stream()
                .filter(res -> res.getApartment().getId().equals(userApartment.getId()))
                .findFirst()
                .orElseThrow(() -> new UserMessageException("Không tìm thấy thông tin cư dân"));

        // Kiểm tra sự kiện tồn tại
        Event event = eventRepository.findById(apiRequest.getEventId())
                .orElseThrow(() -> new UserMessageException("Sự kiện không tồn tại"));

        // Kiểm tra sự kiện có công khai không
        if (!event.getIsPublic()) {
            throw new UserMessageException("Sự kiện này không công khai");
        }

        // Kiểm tra sự kiện chưa diễn ra
        if (event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new UserMessageException("Không thể đăng ký sự kiện đã diễn ra");
        }

        // Log thông tin đăng ký (vì không có bảng riêng để lưu)
        String registrationInfo = String.format(
                "Cư dân %s (Căn hộ: %s) đã đăng ký sự kiện '%s' vào %s. Ghi chú: %s",
                resident.getFullName(),
                userApartment.getApartmentNumber(),
                event.getTitle(),
                LocalDateTime.now(),
                apiRequest.getNotes() != null ? apiRequest.getNotes() : "Không có");

        // Có thể lưu vào log file hoặc database log table
        System.out.println(registrationInfo);

        return ApiResult.success(null, "Đăng ký sự kiện thành công");
    }

    @Override
    public ApiResult<String> cancelEventRegistration(UUID eventId, String currentUsername) {
        // Kiểm tra user tồn tại
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

        // Kiểm tra user có phải là RESIDENT không
        if (!UserRole.RESIDENT.equals(user.getRole())) {
            throw new UserMessageException("Chỉ cư dân mới có thể hủy đăng ký sự kiện");
        }

        // Tìm apartment thuộc về user này (user là owner)
        List<Apartment> apartments = apartmentRepository.findAll();
        Apartment userApartment = apartments.stream()
                .filter(apt -> apt.getOwner() != null && apt.getOwner().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new UserMessageException("Không tìm thấy căn hộ của người dùng này"));

        // Tìm resident thuộc apartment này
        List<Resident> allResidents = residentRepository.findAll();
        Resident resident = allResidents.stream()
                .filter(res -> res.getApartment().getId().equals(userApartment.getId()))
                .findFirst()
                .orElseThrow(() -> new UserMessageException("Không tìm thấy thông tin cư dân"));

        // Kiểm tra sự kiện tồn tại
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new UserMessageException("Sự kiện không tồn tại"));

        // Kiểm tra sự kiện chưa diễn ra
        if (event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new UserMessageException("Không thể hủy đăng ký sự kiện đã diễn ra");
        }

        // Log thông tin hủy đăng ký
        String cancellationInfo = String.format(
                "Cư dân %s (Căn hộ: %s) đã hủy đăng ký sự kiện '%s' vào %s",
                resident.getFullName(),
                userApartment.getApartmentNumber(),
                event.getTitle(),
                LocalDateTime.now());

        System.out.println(cancellationInfo);

        return ApiResult.success(null, "Hủy đăng ký sự kiện thành công");
    }

    private EventGetsResponse mapToEventResponse(Event event) {
        return new EventGetsResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation()
        );
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Không xác định được người dùng");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getId();
        }
        throw new RuntimeException("Principal không chứa thông tin userId");
    }

    @Override
    public ApiResult<EventGetResponse> getEventDetails(UUID eventId) {
        // TODO Auto-generated method stub
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new UserMessageException("Sự kiện không tồn tại"));

        EventGetResponse response = new EventGetResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getEventType(),
                event.getCreatedBy().getUsername(),
                event.getIsPublic()
        );

        return ApiResult.success(response, "Lấy thông tin sự kiện thành công");
    }

}