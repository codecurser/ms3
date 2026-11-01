package com.examportal.question.controller;

import com.examportal.question.dto.response.PublicQuestionResponse;
import com.examportal.question.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "Public Student Questions", description = "Public endpoints for student test-takers (strictly sanitised without answers)")
public class PublicQuestionController {

    private final QuestionService questionService;

    @GetMapping("/exams/{examId}/questions")
    @Operation(summary = "Get exam questions for test-takers (strictly without isCorrect or explanations)")
    public ResponseEntity<List<PublicQuestionResponse>> getPublicQuestions(
            @PathVariable UUID examId
    ) {
        log.info("Public request for exam questions: {}", examId);
        List<PublicQuestionResponse> questions = questionService.getPublicQuestionsForExam(examId);
        return ResponseEntity.ok(questions);
    }
}

