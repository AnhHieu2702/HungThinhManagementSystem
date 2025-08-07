package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebDeviceController {
    @GetMapping("/device")
    public String devicePage() {
        return "device";
    }
}
