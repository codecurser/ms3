package com.examportal.question.controller;

import com.examportal.question.dto.response.ExamAnswerKeyResponse;
import com.examportal.question.dto.response.OptionResponse;
import com.examportal.question.dto.response.QuestionAnswerKeyItem;
import com.examportal.question.entity.QuestionType;
import com.examportal.question.security.JwtAuthenticationFilter;
import com.examportal.question.service.QuestionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InternalQuestionController.class)
@AutoConfigureMockMvc(addFilters = false)
class InternalQuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionService questionService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("Should return answer key payload for MS4 grading service")
    void testGetExamAnswerKey() throws Exception {
        UUID examId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        UUID correctOptionId = UUID.randomUUID();

        ExamAnswerKeyResponse response = ExamAnswerKeyResponse.builder()
                .examId(examId)
                .totalQuestions(1)
                .totalPoints(5)
                .questions(List.of(
                        QuestionAnswerKeyItem.builder()
                                .questionId(questionId)
                                .questionType(QuestionType.SINGLE_CHOICE)
                                .points(5)
                                .orderIndex(0)
                                .explanation("Sample explanation")
                                .correctOptionIds(List.of(correctOptionId))
                                .correctOptions(List.of(
                                        OptionResponse.builder()
                                                .id(correctOptionId)
                                                .optionText("Correct choice")
                                                .isCorrect(true)
                                                .orderIndex(0)
                                                .build()
                                ))
                                .build()
                ))
                .build();

        when(questionService.getExamAnswerKey(examId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/internal/exams/{examId}/answer-key", examId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.examId").value(examId.toString()))
                .andExpect(jsonPath("$.totalQuestions").value(1))
                .andExpect(jsonPath("$.totalPoints").value(5))
                .andExpect(jsonPath("$.questions", hasSize(1)))
                .andExpect(jsonPath("$.questions[0].correctOptionIds[0]").value(correctOptionId.toString()))
                .andExpect(jsonPath("$.questions[0].explanation").value("Sample explanation"));
    }
}

