package com.apartment.models.dtos.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import groovy.transform.builder.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventGetsResponse {
    private UUID id;
    private String title;
    private String description;
    private String location;
}