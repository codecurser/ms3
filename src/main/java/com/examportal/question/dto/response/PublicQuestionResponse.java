package com.examportal.question.dto.response;

import com.examportal.question.entity.QuestionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Public student view of an exam question without answers or solution explanations")
public class PublicQuestionResponse {

    @Schema(description = "Question unique identifier")
    private UUID id;

    @Schema(description = "Associated exam UUID")
    private UUID examId;

    @Schema(description = "Question prompt text")
    private String questionText;

    @Schema(description = "Question type", example = "SINGLE_CHOICE")
    private QuestionType questionType;

    @Schema(description = "Points awarded for this question", example = "1")
    private int points;

    @Schema(description = "Display order index in the exam", example = "0")
    private int orderIndex;

    @Schema(description = "List of options for this question (strictly without isCorrect field)")
    private List<PublicOptionResponse> options;
}

