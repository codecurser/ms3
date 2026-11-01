package com.examportal.question.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating or updating an option")
public class OptionRequest {

    @Schema(description = "Option ID (optional for creation, used when updating existing option)")
    private UUID id;

    @NotBlank(message = "Option text is required")
    @Schema(description = "Text of the option choice", example = "Paris")
    private String optionText;

    @NotNull(message = "isCorrect flag must be specified")
    @Schema(description = "Flag indicating whether this option is correct", example = "true")
    private Boolean isCorrect;

    @Schema(description = "Display order of the option", example = "0")
    private Integer orderIndex;
}

