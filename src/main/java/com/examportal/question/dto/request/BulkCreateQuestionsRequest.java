package com.examportal.question.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for bulk creating questions")
public class BulkCreateQuestionsRequest {

    @NotEmpty(message = "Questions list cannot be empty")
    @Valid
    @Schema(description = "List of questions to create")
    private List<CreateQuestionRequest> questions;
}

