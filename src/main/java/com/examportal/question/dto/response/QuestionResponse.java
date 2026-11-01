package com.examportal.question.dto.response;

import com.examportal.question.entity.QuestionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Creator response representation of a question with full details including isCorrect flags")
public class QuestionResponse {

    @Schema(description = "Question unique identifier")
    private UUID id;

    @Schema(description = "Associated exam UUID")
    private UUID examId;

    @Schema(description = "Creator user UUID")
    private UUID creatorId;

    @Schema(description = "Text of the question")
    private String questionText;

    @Schema(description = "Question type", example = "SINGLE_CHOICE")
    private QuestionType questionType;

    @Schema(description = "Points awarded for this question", example = "2")
    private int points;

    @Schema(description = "Order index of the question in the exam", example = "0")
    private int orderIndex;

    @Schema(description = "Explanation of the solution")
    private String explanation;

    @Schema(description = "List of options for this question including correctness")
    private List<OptionResponse> options;

    @Schema(description = "Timestamp when the question was created")
    private Instant createdAt;

    @Schema(description = "Timestamp when the question was last updated")
    private Instant updatedAt;
}

