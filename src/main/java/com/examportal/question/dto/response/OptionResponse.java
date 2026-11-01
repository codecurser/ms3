package com.examportal.question.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Creator response representation of an option, including isCorrect flag")
public class OptionResponse {

    @Schema(description = "Option unique identifier")
    private UUID id;

    @Schema(description = "Option text")
    private String optionText;

    @Schema(description = "Whether this option is a correct answer", example = "true")
    private boolean isCorrect;

    @Schema(description = "Display order of the option", example = "0")
    private int orderIndex;
}

