package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebMaintenanceController {
    @GetMapping("/maintenance")
    public String maintenancePage() {
        return "maintenance";
    }
}