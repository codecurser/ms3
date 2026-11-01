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
@Schema(description = "Answer key data for an individual question, used by grading service MS4")
public class QuestionAnswerKeyItem {

    @Schema(description = "Question ID")
    private UUID questionId;

    @Schema(description = "Question type", example = "SINGLE_CHOICE")
    private QuestionType questionType;

    @Schema(description = "Points value for this question", example = "2")
    private int points;

    @Schema(description = "Order index in the exam", example = "0")
    private int orderIndex;

    @Schema(description = "Explanation of the correct answer")
    private String explanation;

    @Schema(description = "List of UUIDs of all options that are marked as correct")
    private List<UUID> correctOptionIds;

    @Schema(description = "List of full correct option details")
    private List<OptionResponse> correctOptions;
}

