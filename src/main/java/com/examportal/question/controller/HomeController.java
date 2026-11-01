package com.examportal.question.controller;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @Hidden
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "Question Service (MS3)",
                "status", "UP",
                "description", "Question Management Microservice for Online Examination Portal",
                "swaggerUi", "/swagger-ui.html",
                "apiDocs", "/v3/api-docs"
        ));
    }

    @Hidden
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}

