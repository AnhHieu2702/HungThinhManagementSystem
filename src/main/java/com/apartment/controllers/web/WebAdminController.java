package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebAdminController {
    @GetMapping("/admin")
    public String apartmentPage() {
        return "admin";
    }
}
