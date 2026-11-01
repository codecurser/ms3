package com.examportal.question.dto.request;

import com.examportal.question.entity.QuestionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating a question")
public class CreateQuestionRequest {

    @NotBlank(message = "Question text is required")
    @Schema(description = "Text of the question", example = "What is the capital of France?")
    private String questionText;

    @NotNull(message = "Question type is required (SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE)")
    @Schema(description = "Type of question", example = "SINGLE_CHOICE")
    private QuestionType questionType;

    @NotNull(message = "Points are required")
    @Min(value = 1, message = "Points must be at least 1")
    @Schema(description = "Points awarded for this question", example = "2")
    private Integer points;

    @Schema(description = "Display order index in the exam", example = "0")
    private Integer orderIndex;

    @Schema(description = "Explanation of the correct answer", example = "Paris is the capital of France.")
    private String explanation;

    @NotEmpty(message = "Options list cannot be empty")
    @Valid
    @Schema(description = "List of options for this question")
    private List<OptionRequest> options;
}

