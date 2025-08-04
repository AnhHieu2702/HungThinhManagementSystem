package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.events.EventGetsResponse;
import com.apartment.models.dtos.events.EventRegistrationRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IEventService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api")
@Tag(name = "Event Management")
public class EventController extends ApiBaseController {
    private final IEventService eventService;

    public EventController(IEventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("resident/events/upcoming")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<List<EventGetsResponse>>> getUpcomingEvents(
            @RequestParam(required = false) String eventType) {
        return executeApiResult(() -> eventService.getUpcomingEvents(eventType));
    }

    @PostMapping("resident/events/register")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<String>> registerForEvent(@Valid @RequestBody EventRegistrationRequest apiRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        return executeApiResult(() -> eventService.registerForEvent(apiRequest, currentUsername));
    }

    @DeleteMapping("resident/events/{eventId}/cancel-registration")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<String>> cancelEventRegistration(@PathVariable UUID eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        return executeApiResult(() -> eventService.cancelEventRegistration(eventId, currentUsername));
    }
}