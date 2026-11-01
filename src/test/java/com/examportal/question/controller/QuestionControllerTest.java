package com.examportal.question.controller;

import com.examportal.question.dto.request.CreateQuestionRequest;
import com.examportal.question.dto.request.OptionRequest;
import com.examportal.question.dto.response.OptionResponse;
import com.examportal.question.dto.response.QuestionResponse;
import com.examportal.question.entity.QuestionType;
import com.examportal.question.security.AuthenticatedUser;
import com.examportal.question.security.JwtAuthenticationFilter;
import com.examportal.question.service.QuestionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuestionController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private QuestionService questionService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private UUID creatorId;
    private UUID examId;
    private UUID questionId;

    @BeforeEach
    void setUp() {
        creatorId = UUID.randomUUID();
        examId = UUID.randomUUID();
        questionId = UUID.randomUUID();

        AuthenticatedUser user = AuthenticatedUser.builder()
                .userId(creatorId)
                .email("creator@examportal.com")
                .role("ROLE_CREATOR")
                .build();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("POST /api/v1/exams/{examId}/questions creates question and returns 201")
    void testCreateQuestion() throws Exception {
        CreateQuestionRequest request = CreateQuestionRequest.builder()
                .questionText("What is the capital of Japan?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(2)
                .options(List.of(
                        OptionRequest.builder().optionText("Tokyo").isCorrect(true).build(),
                        OptionRequest.builder().optionText("Kyoto").isCorrect(false).build()
                ))
                .build();

        QuestionResponse response = QuestionResponse.builder()
                .id(questionId)
                .examId(examId)
                .creatorId(creatorId)
                .questionText("What is the capital of Japan?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(2)
                .options(List.of(
                        OptionResponse.builder().id(UUID.randomUUID()).optionText("Tokyo").isCorrect(true).build(),
                        OptionResponse.builder().id(UUID.randomUUID()).optionText("Kyoto").isCorrect(false).build()
                ))
                .build();

        when(questionService.createQuestion(eq(examId), any(CreateQuestionRequest.class), eq(creatorId)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/exams/{examId}/questions", examId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(questionId.toString()))
                .andExpect(jsonPath("$.questionText").value("What is the capital of Japan?"))
                .andExpect(jsonPath("$.options[0].isCorrect").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/exams/{examId}/questions returns questions list")
    void testGetQuestionsForExam() throws Exception {
        QuestionResponse response = QuestionResponse.builder()
                .id(questionId)
                .examId(examId)
                .creatorId(creatorId)
                .questionText("Sample Question")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .options(List.of())
                .build();

        when(questionService.getQuestionsForCreator(eq(examId), eq(creatorId)))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/exams/{examId}/questions", examId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].questionText").value("Sample Question"));
    }

    @Test
    @DisplayName("DELETE /api/v1/questions/{questionId} returns 204 No Content")
    void testDeleteQuestion() throws Exception {
        doNothing().when(questionService).deleteQuestion(eq(questionId), eq(creatorId));

        mockMvc.perform(delete("/api/v1/questions/{questionId}", questionId))
                .andExpect(status().isNoContent());
    }
}

