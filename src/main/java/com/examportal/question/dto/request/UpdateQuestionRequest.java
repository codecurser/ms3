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
@Schema(description = "Request object for updating a question")
public class UpdateQuestionRequest {

    @NotBlank(message = "Question text is required")
    @Schema(description = "Updated text of the question", example = "What is the capital of Germany?")
    private String questionText;

    @NotNull(message = "Question type is required")
    @Schema(description = "Updated type of question", example = "SINGLE_CHOICE")
    private QuestionType questionType;

    @NotNull(message = "Points are required")
    @Min(value = 1, message = "Points must be at least 1")
    @Schema(description = "Updated points", example = "3")
    private Integer points;

    @Schema(description = "Updated order index", example = "1")
    private Integer orderIndex;

    @Schema(description = "Updated explanation", example = "Berlin is the capital of Germany.")
    private String explanation;

    @NotEmpty(message = "Options list cannot be empty")
    @Valid
    @Schema(description = "Updated list of options")
    private List<OptionRequest> options;
}

