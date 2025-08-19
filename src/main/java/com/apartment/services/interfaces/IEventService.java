package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;

import com.apartment.models.dtos.events.EventCreateRequest;
import com.apartment.models.dtos.events.EventGetResponse;
import com.apartment.models.dtos.events.EventGetsResponse;
import com.apartment.models.dtos.events.EventRegistrationRequest;
import com.apartment.models.global.ApiResult;


public interface IEventService {

    ApiResult<String> createEvent(Authentication auth, EventCreateRequest apiRequest);

    ApiResult<List<EventGetsResponse>> getUpcomingEvents();
    ApiResult<EventGetResponse> getEventDetails(UUID eventId);

    ApiResult<String> registerForEvent(EventRegistrationRequest apiRequest, String currentUsername);

    ApiResult<String> cancelEventRegistration(UUID eventId, String currentUsername);
}