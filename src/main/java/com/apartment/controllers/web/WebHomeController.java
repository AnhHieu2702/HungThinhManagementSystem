package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebHomeController {
    @GetMapping("/home")
    public String homePage() {
        return "home";
    }
}
