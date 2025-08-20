package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebNotificationController {
    @GetMapping("/notification")
    public String maintenancePage() {
        return "notification";
    }
}