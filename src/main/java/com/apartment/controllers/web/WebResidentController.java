package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebResidentController {
    @GetMapping("/resident")
    public String apartmentPage() {
        return "resident";
    }
}