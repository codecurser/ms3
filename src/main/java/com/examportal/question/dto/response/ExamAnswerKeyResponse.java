package com.examportal.question.dto.response;

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
@Schema(description = "Exam Answer Key response used by grading service (MS4)")
public class ExamAnswerKeyResponse {

    @Schema(description = "Exam UUID")
    private UUID examId;

    @Schema(description = "Total number of questions in the exam", example = "10")
    private int totalQuestions;

    @Schema(description = "Sum total of all question points in the exam", example = "50")
    private int totalPoints;

    @Schema(description = "List of answer keys for each question in the exam")
    private List<QuestionAnswerKeyItem> questions;
}

