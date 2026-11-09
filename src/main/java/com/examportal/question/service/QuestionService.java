package com.examportal.question.service;

import com.examportal.question.dto.request.CreateQuestionRequest;
import com.examportal.question.dto.request.OptionRequest;
import com.examportal.question.dto.request.UpdateQuestionRequest;
import com.examportal.question.dto.response.*;
import com.examportal.question.entity.Option;
import com.examportal.question.entity.Question;
import com.examportal.question.entity.QuestionType;
import com.examportal.question.exception.InvalidQuestionException;
import com.examportal.question.exception.QuestionNotFoundException;
import com.examportal.question.exception.UnauthorizedQuestionAccessException;
import com.examportal.question.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public QuestionResponse createQuestion(UUID examId, CreateQuestionRequest request, UUID creatorId) {
        log.info("Creating question for examId: {} by creatorId: {}", examId, creatorId);
        verifyExamAccess(examId, creatorId);
        validateOptions(request.getQuestionType(), request.getOptions());

        int orderIndex = request.getOrderIndex() != null ? request.getOrderIndex() : (int) questionRepository.countByExamId(examId);

        Question question = Question.builder()
                .examId(examId)
                .creatorId(creatorId)
                .questionText(request.getQuestionText().trim())
                .questionType(request.getQuestionType())
                .points(request.getPoints() != null ? request.getPoints() : 1)
                .orderIndex(orderIndex)
                .explanation(request.getExplanation() != null ? request.getExplanation().trim() : null)
                .options(new ArrayList<>())
                .build();

        for (int i = 0; i < request.getOptions().size(); i++) {
            OptionRequest optReq = request.getOptions().get(i);
            int optOrder = optReq.getOrderIndex() != null ? optReq.getOrderIndex() : i;
            Option option = Option.builder()
                    .optionText(optReq.getOptionText().trim())
                    .isCorrect(Boolean.TRUE.equals(optReq.getIsCorrect()))
                    .orderIndex(optOrder)
                    .build();
            question.addOption(option);
        }

        Question saved = questionRepository.save(question);
        log.info("Successfully created question with id: {}", saved.getId());
        return mapToQuestionResponse(saved);
    }

    @Transactional
    public List<QuestionResponse> createQuestionsBulk(UUID examId, List<CreateQuestionRequest> requests, UUID creatorId) {
        log.info("Bulk creating {} questions for examId: {} by creatorId: {}", requests.size(), examId, creatorId);
        List<QuestionResponse> responses = new ArrayList<>();
        int currentCount = (int) questionRepository.countByExamId(examId);

        for (int i = 0; i < requests.size(); i++) {
            CreateQuestionRequest req = requests.get(i);
            if (req.getOrderIndex() == null) {
                req.setOrderIndex(currentCount + i);
            }
            responses.add(createQuestion(examId, req, creatorId));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsForCreator(UUID examId, UUID creatorId) {
        log.info("Fetching questions for examId: {} for creatorId: {}", examId, creatorId);
        verifyExamAccess(examId, creatorId);
        List<Question> questions = questionRepository.findByExamIdWithOptions(examId);
        return questions.stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestionByIdForCreator(UUID questionId, UUID creatorId) {
        log.info("Fetching questionId: {} for creatorId: {}", questionId, creatorId);
        Question question = questionRepository.findByIdWithOptions(questionId)
                .orElseThrow(() -> new QuestionNotFoundException("Question not found with id: " + questionId));

        verifyCreatorOwnership(question, creatorId);
        return mapToQuestionResponse(question);
    }

    @Transactional
    public QuestionResponse updateQuestion(UUID questionId, UpdateQuestionRequest request, UUID creatorId) {
        log.info("Updating questionId: {} by creatorId: {}", questionId, creatorId);
        Question question = questionRepository.findByIdWithOptions(questionId)
                .orElseThrow(() -> new QuestionNotFoundException("Question not found with id: " + questionId));

        verifyCreatorOwnership(question, creatorId);
        validateOptions(request.getQuestionType(), request.getOptions());

        question.setQuestionText(request.getQuestionText().trim());
        question.setQuestionType(request.getQuestionType());
        question.setPoints(request.getPoints());
        if (request.getOrderIndex() != null) {
            question.setOrderIndex(request.getOrderIndex());
        }
        question.setExplanation(request.getExplanation() != null ? request.getExplanation().trim() : null);

        // Clear existing options and attach new ones
        question.clearOptions();
        for (int i = 0; i < request.getOptions().size(); i++) {
            OptionRequest optReq = request.getOptions().get(i);
            int optOrder = optReq.getOrderIndex() != null ? optReq.getOrderIndex() : i;
            Option option = Option.builder()
                    .id(optReq.getId())
                    .optionText(optReq.getOptionText().trim())
                    .isCorrect(Boolean.TRUE.equals(optReq.getIsCorrect()))
                    .orderIndex(optOrder)
                    .build();
            question.addOption(option);
        }

        Question updated = questionRepository.save(question);
        log.info("Successfully updated questionId: {}", updated.getId());
        return mapToQuestionResponse(updated);
    }

    @Transactional
    public void deleteQuestion(UUID questionId, UUID creatorId) {
        log.info("Deleting questionId: {} by creatorId: {}", questionId, creatorId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new QuestionNotFoundException("Question not found with id: " + questionId));

        verifyCreatorOwnership(question, creatorId);
        questionRepository.delete(question);
        log.info("Successfully deleted questionId: {}", questionId);
    }

    @Transactional(readOnly = true)
    public List<PublicQuestionResponse> getPublicQuestionsForExam(UUID examId) {
        log.info("Fetching public questions for examId: {}", examId);
        List<Question> questions = questionRepository.findByExamIdWithOptions(examId);

        return questions.stream()
                .map(this::mapToPublicQuestionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamAnswerKeyResponse getExamAnswerKey(UUID examId) {
        log.info("Generating answer key for examId: {}", examId);
        List<Question> questions = questionRepository.findByExamIdWithOptions(examId);

        int totalQuestions = questions.size();
        int totalPoints = questions.stream().mapToInt(Question::getPoints).sum();

        List<QuestionAnswerKeyItem> items = questions.stream().map(q -> {
            List<UUID> correctIds = q.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(Option::getId)
                    .collect(Collectors.toList());

            List<OptionResponse> correctOptions = q.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(opt -> OptionResponse.builder()
                            .id(opt.getId())
                            .optionText(opt.getOptionText())
                            .isCorrect(opt.isCorrect())
                            .orderIndex(opt.getOrderIndex())
                            .build())
                    .collect(Collectors.toList());

            return QuestionAnswerKeyItem.builder()
                    .questionId(q.getId())
                    .questionType(q.getQuestionType())
                    .points(q.getPoints())
                    .orderIndex(q.getOrderIndex())
                    .explanation(q.getExplanation())
                    .correctOptionIds(correctIds)
                    .correctOptions(correctOptions)
                    .build();
        }).collect(Collectors.toList());

        return ExamAnswerKeyResponse.builder()
                .examId(examId)
                .totalQuestions(totalQuestions)
                .totalPoints(totalPoints)
                .questions(items)
                .build();
    }

    private void verifyExamAccess(UUID examId, UUID creatorId) {
        // 1. Direct cross-service check against shared 'exams' table if available in database
        if (jdbcTemplate != null) {
            try {
                List<UUID> owners = jdbcTemplate.query(
                        "SELECT creator_id FROM exams WHERE id = ?",
                        (rs, rowNum) -> (UUID) rs.getObject("creator_id"),
                        examId
                );
                if (!owners.isEmpty()) {
                    if (!creatorId.equals(owners.get(0))) {
                        log.warn("Creator {} attempted unauthorized access to exam {} owned by creator {}",
                                creatorId, examId, owners.get(0));
                        throw new UnauthorizedQuestionAccessException("You do not have permission to view or manage questions for this exam.");
                    }
                    return;
                }
            } catch (UnauthorizedQuestionAccessException uae) {
                throw uae;
            } catch (Exception e) {
                log.debug("Direct exam table check skipped: {}", e.getMessage());
            }
        }

        // 2. Question-level ownership validation for existing questions
        List<Question> existingQuestions = questionRepository.findByExamIdOrderByOrderIndexAscCreatedAtAsc(examId);
        if (!existingQuestions.isEmpty()) {
            boolean hasUnauthorized = existingQuestions.stream()
                    .anyMatch(q -> !creatorId.equals(q.getCreatorId()));
            if (hasUnauthorized) {
                log.warn("Creator {} attempted unauthorized access to questions for exam {} created by another user",
                        creatorId, examId);
                throw new UnauthorizedQuestionAccessException("You do not have permission to view or manage questions for this exam.");
            }
        }
    }

    private void verifyCreatorOwnership(Question question, UUID creatorId) {
        if (!question.getCreatorId().equals(creatorId)) {
            log.warn("Creator {} attempted to access question {} owned by creator {}",
                    creatorId, question.getId(), question.getCreatorId());
            throw new UnauthorizedQuestionAccessException("You are not authorized to modify or view this question");
        }
    }

    private void validateOptions(QuestionType type, List<OptionRequest> options) {
        if (options == null || options.isEmpty()) {
            throw new InvalidQuestionException("Question must have at least one option");
        }

        long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getIsCorrect())).count();

        switch (type) {
            case SINGLE_CHOICE -> {
                if (options.size() < 2) {
                    throw new InvalidQuestionException("SINGLE_CHOICE question must have at least 2 options");
                }
                if (correctCount != 1) {
                    throw new InvalidQuestionException("SINGLE_CHOICE question must have exactly one correct option (found: " + correctCount + ")");
                }
            }
            case MULTIPLE_CHOICE -> {
                if (options.size() < 2) {
                    throw new InvalidQuestionException("MULTIPLE_CHOICE question must have at least 2 options");
                }
                if (correctCount < 1) {
                    throw new InvalidQuestionException("MULTIPLE_CHOICE question must have at least one correct option");
                }
            }
            case TRUE_FALSE -> {
                if (options.size() != 2) {
                    throw new InvalidQuestionException("TRUE_FALSE question must have exactly 2 options (found: " + options.size() + ")");
                }
                if (correctCount != 1) {
                    throw new InvalidQuestionException("TRUE_FALSE question must have exactly one correct option (found: " + correctCount + ")");
                }
            }
        }
    }

    private QuestionResponse mapToQuestionResponse(Question question) {
        List<OptionResponse> optionResponses = question.getOptions() != null
                ? question.getOptions().stream()
                .sorted(Comparator.comparingInt(Option::getOrderIndex))
                .map(o -> OptionResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .isCorrect(o.isCorrect())
                        .orderIndex(o.getOrderIndex())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        return QuestionResponse.builder()
                .id(question.getId())
                .examId(question.getExamId())
                .creatorId(question.getCreatorId())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .explanation(question.getExplanation())
                .options(optionResponses)
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    private PublicQuestionResponse mapToPublicQuestionResponse(Question question) {
        List<PublicOptionResponse> publicOptions = question.getOptions() != null
                ? question.getOptions().stream()
                .sorted(Comparator.comparingInt(Option::getOrderIndex))
                .map(o -> PublicOptionResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .orderIndex(o.getOrderIndex())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        return PublicQuestionResponse.builder()
                .id(question.getId())
                .examId(question.getExamId())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .options(publicOptions)
                .build();
    }
}

