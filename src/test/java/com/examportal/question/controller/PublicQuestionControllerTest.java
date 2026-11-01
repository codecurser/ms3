package com.examportal.question.controller;

import com.examportal.question.dto.response.PublicOptionResponse;
import com.examportal.question.dto.response.PublicQuestionResponse;
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

@WebMvcTest(PublicQuestionController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicQuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionService questionService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("CRITICAL: Public endpoint must NOT leak isCorrect field or explanation")
    void testGetPublicQuestionsPayloadSanitization() throws Exception {
        UUID examId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        UUID option1Id = UUID.randomUUID();
        UUID option2Id = UUID.randomUUID();

        PublicQuestionResponse response = PublicQuestionResponse.builder()
                .id(questionId)
                .examId(examId)
                .questionText("What is the speed of light?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(2)
                .orderIndex(0)
                .options(List.of(
                        PublicOptionResponse.builder().id(option1Id).optionText("3 x 10^8 m/s").orderIndex(0).build(),
                        PublicOptionResponse.builder().id(option2Id).optionText("1500 m/s").orderIndex(1).build()
                ))
                .build();

        when(questionService.getPublicQuestionsForExam(examId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/public/exams/{examId}/questions", examId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].questionText").value("What is the speed of light?"))
                .andExpect(jsonPath("$[0].points").value(2))
                .andExpect(jsonPath("$[0].options", hasSize(2)))
                .andExpect(jsonPath("$[0].options[0].optionText").value("3 x 10^8 m/s"))
                // Assert that isCorrect does NOT exist in the response payload
                .andExpect(jsonPath("$[0].options[0].isCorrect").doesNotExist())
                .andExpect(jsonPath("$[0].options[1].isCorrect").doesNotExist())
                .andExpect(jsonPath("$[0].explanation").doesNotExist());
    }
}

