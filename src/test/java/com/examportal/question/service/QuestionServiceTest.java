package com.examportal.question.service;

import com.examportal.question.dto.request.CreateQuestionRequest;
import com.examportal.question.dto.request.OptionRequest;
import com.examportal.question.dto.request.UpdateQuestionRequest;
import com.examportal.question.dto.response.ExamAnswerKeyResponse;
import com.examportal.question.dto.response.PublicQuestionResponse;
import com.examportal.question.dto.response.QuestionResponse;
import com.examportal.question.entity.Option;
import com.examportal.question.entity.Question;
import com.examportal.question.entity.QuestionType;
import com.examportal.question.exception.InvalidQuestionException;
import com.examportal.question.exception.QuestionNotFoundException;
import com.examportal.question.exception.UnauthorizedQuestionAccessException;
import com.examportal.question.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionService questionService;

    private UUID examId;
    private UUID creatorId;
    private CreateQuestionRequest singleChoiceRequest;

    @BeforeEach
    void setUp() {
        examId = UUID.randomUUID();
        creatorId = UUID.randomUUID();

        singleChoiceRequest = CreateQuestionRequest.builder()
                .questionText("What is 2 + 2?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(2)
                .orderIndex(0)
                .explanation("Basic arithmetic")
                .options(List.of(
                        OptionRequest.builder().optionText("3").isCorrect(false).orderIndex(0).build(),
                        OptionRequest.builder().optionText("4").isCorrect(true).orderIndex(1).build(),
                        OptionRequest.builder().optionText("5").isCorrect(false).orderIndex(2).build()
                ))
                .build();
    }

    @Test
    @DisplayName("Should create SINGLE_CHOICE question successfully")
    void testCreateQuestionSuccess() {
        when(questionRepository.countByExamId(examId)).thenReturn(0L);
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> {
            Question q = invocation.getArgument(0);
            q.setId(UUID.randomUUID());
            return q;
        });

        QuestionResponse response = questionService.createQuestion(examId, singleChoiceRequest, creatorId);

        assertNotNull(response);
        assertEquals("What is 2 + 2?", response.getQuestionText());
        assertEquals(QuestionType.SINGLE_CHOICE, response.getQuestionType());
        assertEquals(2, response.getPoints());
        assertEquals(3, response.getOptions().size());
        verify(questionRepository, times(1)).save(any(Question.class));
    }

    @Test
    @DisplayName("Should reject SINGLE_CHOICE question with zero correct options")
    void testSingleChoiceZeroCorrect() {
        CreateQuestionRequest invalid = CreateQuestionRequest.builder()
                .questionText("Invalid Question")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .options(List.of(
                        OptionRequest.builder().optionText("A").isCorrect(false).build(),
                        OptionRequest.builder().optionText("B").isCorrect(false).build()
                ))
                .build();

        assertThrows(InvalidQuestionException.class, () ->
                questionService.createQuestion(examId, invalid, creatorId));
    }

    @Test
    @DisplayName("Should reject SINGLE_CHOICE question with multiple correct options")
    void testSingleChoiceMultipleCorrect() {
        CreateQuestionRequest invalid = CreateQuestionRequest.builder()
                .questionText("Invalid Question")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .options(List.of(
                        OptionRequest.builder().optionText("A").isCorrect(true).build(),
                        OptionRequest.builder().optionText("B").isCorrect(true).build()
                ))
                .build();

        assertThrows(InvalidQuestionException.class, () ->
                questionService.createQuestion(examId, invalid, creatorId));
    }

    @Test
    @DisplayName("Should reject TRUE_FALSE question with other than 2 options")
    void testTrueFalseInvalidOptionCount() {
        CreateQuestionRequest invalid = CreateQuestionRequest.builder()
                .questionText("Earth is flat")
                .questionType(QuestionType.TRUE_FALSE)
                .points(1)
                .options(List.of(
                        OptionRequest.builder().optionText("True").isCorrect(false).build()
                ))
                .build();

        assertThrows(InvalidQuestionException.class, () ->
                questionService.createQuestion(examId, invalid, creatorId));
    }

    @Test
    @DisplayName("Should prevent updating question owned by another creator")
    void testUpdateQuestionUnauthorized() {
        UUID questionId = UUID.randomUUID();
        UUID otherCreatorId = UUID.randomUUID();

        Question existing = Question.builder()
                .id(questionId)
                .examId(examId)
                .creatorId(otherCreatorId)
                .options(new ArrayList<>())
                .build();

        when(questionRepository.findByIdWithOptions(questionId)).thenReturn(Optional.of(existing));

        UpdateQuestionRequest updateReq = UpdateQuestionRequest.builder()
                .questionText("New Text")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(2)
                .options(List.of(
                        OptionRequest.builder().optionText("A").isCorrect(true).build(),
                        OptionRequest.builder().optionText("B").isCorrect(false).build()
                ))
                .build();

        assertThrows(UnauthorizedQuestionAccessException.class, () ->
                questionService.updateQuestion(questionId, updateReq, creatorId));
    }

    @Test
    @DisplayName("Should prevent deleting question owned by another creator")
    void testDeleteQuestionUnauthorized() {
        UUID questionId = UUID.randomUUID();
        UUID otherCreatorId = UUID.randomUUID();

        Question existing = Question.builder()
                .id(questionId)
                .examId(examId)
                .creatorId(otherCreatorId)
                .build();

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(existing));

        assertThrows(UnauthorizedQuestionAccessException.class, () ->
                questionService.deleteQuestion(questionId, creatorId));
    }

    @Test
    @DisplayName("Should get public questions without leaking isCorrect")
    void testGetPublicQuestions() {
        UUID qId = UUID.randomUUID();
        Question question = Question.builder()
                .id(qId)
                .examId(examId)
                .creatorId(creatorId)
                .questionText("Sample Question")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .orderIndex(0)
                .options(new ArrayList<>())
                .build();

        Option opt1 = Option.builder().id(UUID.randomUUID()).optionText("Option 1").isCorrect(true).orderIndex(0).build();
        Option opt2 = Option.builder().id(UUID.randomUUID()).optionText("Option 2").isCorrect(false).orderIndex(1).build();
        question.addOption(opt1);
        question.addOption(opt2);

        when(questionRepository.findByExamIdWithOptions(examId)).thenReturn(List.of(question));

        List<PublicQuestionResponse> publicList = questionService.getPublicQuestionsForExam(examId);

        assertEquals(1, publicList.size());
        assertEquals("Sample Question", publicList.get(0).getQuestionText());
        assertEquals(2, publicList.get(0).getOptions().size());
        // Verify PublicQuestionResponse and PublicOptionResponse types don't even have isCorrect
        assertEquals("Option 1", publicList.get(0).getOptions().get(0).getOptionText());
    }

    @Test
    @DisplayName("Should generate accurate answer key for MS4 internal grading")
    void testGetExamAnswerKey() {
        UUID qId = UUID.randomUUID();
        UUID opt1Id = UUID.randomUUID();
        UUID opt2Id = UUID.randomUUID();

        Question question = Question.builder()
                .id(qId)
                .examId(examId)
                .creatorId(creatorId)
                .questionText("Question 1")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(5)
                .options(new ArrayList<>())
                .build();

        Option opt1 = Option.builder().id(opt1Id).optionText("Correct").isCorrect(true).orderIndex(0).build();
        Option opt2 = Option.builder().id(opt2Id).optionText("Wrong").isCorrect(false).orderIndex(1).build();
        question.addOption(opt1);
        question.addOption(opt2);

        when(questionRepository.findByExamIdWithOptions(examId)).thenReturn(List.of(question));

        ExamAnswerKeyResponse key = questionService.getExamAnswerKey(examId);

        assertNotNull(key);
        assertEquals(examId, key.getExamId());
        assertEquals(1, key.getTotalQuestions());
        assertEquals(5, key.getTotalPoints());
        assertEquals(1, key.getQuestions().get(0).getCorrectOptionIds().size());
        assertEquals(opt1Id, key.getQuestions().get(0).getCorrectOptionIds().get(0));
    }

    @Test
    @DisplayName("Should prevent creator from viewing questions for an exam created by another creator")
    void testGetQuestionsUnauthorizedExamCreator() {
        UUID otherCreatorId = UUID.randomUUID();
        Question existing = Question.builder()
                .id(UUID.randomUUID())
                .examId(examId)
                .creatorId(otherCreatorId)
                .questionText("Question by Ainika")
                .options(new ArrayList<>())
                .build();

        when(questionRepository.findByExamIdOrderByOrderIndexAscCreatedAtAsc(examId))
                .thenReturn(List.of(existing));

        assertThrows(UnauthorizedQuestionAccessException.class, () ->
                questionService.getQuestionsForCreator(examId, creatorId));
    }

    @Test
    @DisplayName("Should allow creator to view questions for their own exam")
    void testGetQuestionsOwnExam() {
        Question existing = Question.builder()
                .id(UUID.randomUUID())
                .examId(examId)
                .creatorId(creatorId)
                .questionText("Question by Abhishek")
                .options(new ArrayList<>())
                .build();

        when(questionRepository.findByExamIdOrderByOrderIndexAscCreatedAtAsc(examId))
                .thenReturn(List.of(existing));
        when(questionRepository.findByExamIdWithOptions(examId))
                .thenReturn(List.of(existing));

        List<QuestionResponse> results = questionService.getQuestionsForCreator(examId, creatorId);
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Question by Abhishek", results.get(0).getQuestionText());
    }
}

