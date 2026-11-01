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
@Schema(description = "Public student view of an option (strictly without correctness indicator)")
public class PublicOptionResponse {

    @Schema(description = "Option unique identifier")
    private UUID id;

    @Schema(description = "Option text")
    private String optionText;

    @Schema(description = "Display order of the option", example = "0")
    private int orderIndex;
}

