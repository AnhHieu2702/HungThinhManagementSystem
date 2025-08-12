package com.apartment.controllers.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebFeedbackController {
    @GetMapping("/feedback")
    public String feedbackPage() {
        return "feedback";
    }
}