package com.devflow.ai.dto;

import com.devflow.ai.model.enums.SprintStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintResponse {

    private Long id;
    private String name;
    private String goal;
    private Long projectId;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private LocalDateTime createdAt;
}
