package com.examportal.question.controller;

import com.examportal.question.dto.response.ExamAnswerKeyResponse;
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

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
@Tag(name = "Internal Evaluation (MS4)", description = "Internal service endpoints for grading and evaluation")
public class InternalQuestionController {

    private final QuestionService questionService;

    @GetMapping("/exams/{examId}/answer-key")
    @Operation(summary = "Get answer key for grading service MS4")
    public ResponseEntity<ExamAnswerKeyResponse> getExamAnswerKey(
            @PathVariable UUID examId
    ) {
        log.info("Internal grading request for exam answer key: {}", examId);
        ExamAnswerKeyResponse answerKey = questionService.getExamAnswerKey(examId);
        return ResponseEntity.ok(answerKey);
    }
}

