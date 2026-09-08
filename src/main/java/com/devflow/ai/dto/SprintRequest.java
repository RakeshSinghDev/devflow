package com.devflow.ai.dto;

import com.devflow.ai.model.enums.SprintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintRequest {

    @NotBlank(message = "Sprint name is required")
    @Size(max = 100, message = "Sprint name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Goal must not exceed 500 characters")
    private String goal;

    private Long projectId;

    private LocalDate startDate;

    private LocalDate endDate;

    private SprintStatus status;
}
