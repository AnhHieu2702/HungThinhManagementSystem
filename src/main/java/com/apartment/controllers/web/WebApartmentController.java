package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebApartmentController {
    @GetMapping("/apartment")
    public String apartmentPage() {
        return "apartment";
    }
}

