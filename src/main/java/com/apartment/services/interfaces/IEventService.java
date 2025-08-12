package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.events.EventGetsResponse;
import com.apartment.models.dtos.events.EventRegistrationRequest;
import com.apartment.models.global.ApiResult;

public interface IEventService {
    ApiResult<List<EventGetsResponse>> getUpcomingEvents(String eventType);
    
    ApiResult<String> registerForEvent(EventRegistrationRequest apiRequest, String currentUsername);
    
    ApiResult<String> cancelEventRegistration(UUID eventId, String currentUsername);
}