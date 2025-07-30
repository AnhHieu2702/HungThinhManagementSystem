package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebAuthController {
    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }
}
