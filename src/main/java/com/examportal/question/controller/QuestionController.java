package com.examportal.question.controller;

import com.examportal.question.dto.request.BulkCreateQuestionsRequest;
import com.examportal.question.dto.request.CreateQuestionRequest;
import com.examportal.question.dto.request.UpdateQuestionRequest;
import com.examportal.question.dto.response.QuestionResponse;
import com.examportal.question.service.QuestionService;
import com.examportal.question.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Creator Questions", description = "Endpoints for exam creators to manage questions and options")
@SecurityRequirement(name = "bearerAuth")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/exams/{examId}/questions")
    @Operation(summary = "Create question with options for an exam")
    public ResponseEntity<QuestionResponse> createQuestion(
            @PathVariable UUID examId,
            @Valid @RequestBody CreateQuestionRequest request
    ) {
        UUID creatorId = SecurityUtil.getCurrentCreatorId();
        QuestionResponse response = questionService.createQuestion(examId, request, creatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/exams/{examId}/questions/bulk")
    @Operation(summary = "Bulk create questions for an exam")
    public ResponseEntity<List<QuestionResponse>> bulkCreateQuestions(
            @PathVariable UUID examId,
            @Valid @RequestBody BulkCreateQuestionsRequest request
    ) {
        UUID creatorId = SecurityUtil.getCurrentCreatorId();
        List<QuestionResponse> responses = questionService.createQuestionsBulk(examId, request.getQuestions(), creatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping("/exams/{examId}/questions")
    @Operation(summary = "Get all questions for an exam (creator view with isCorrect boolean)")
    public ResponseEntity<List<QuestionResponse>> getQuestionsForExam(
            @PathVariable UUID examId
    ) {
        UUID creatorId = SecurityUtil.getCurrentCreatorId();
        List<QuestionResponse> questions = questionService.getQuestionsForCreator(examId, creatorId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/questions/{questionId}")
    @Operation(summary = "Get single question by ID (creator view with isCorrect boolean)")
    public ResponseEntity<QuestionResponse> getQuestionById(
            @PathVariable UUID questionId
    ) {
        UUID creatorId = SecurityUtil.getCurrentCreatorId();
        QuestionResponse question = questionService.getQuestionByIdForCreator(questionId, creatorId);
        return ResponseEntity.ok(question);
    }

    @PutMapping("/questions/{questionId}")
    @Operation(summary = "Update question and options")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable UUID questionId,
            @Valid @RequestBody UpdateQuestionRequest request
    ) {
        UUID creatorId = SecurityUtil.getCurrentCreatorId();
        QuestionResponse updated = questionService.updateQuestion(questionId, request, creatorId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/questions/{questionId}")
    @Operation(summary = "Delete question and its options")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable UUID questionId
    ) {
        UUID creatorId = SecurityUtil.getCurrentCreatorId();
        questionService.deleteQuestion(questionId, creatorId);
        return ResponseEntity.noContent().build();
    }
}

