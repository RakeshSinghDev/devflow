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
public class SprintDTO {

    private Long id;
    private String name;
    private String goal;
    private Long projectId;
    private String projectName;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private LocalDateTime createdAt;

    // Issue Statistics & Calculated Progress
    private long totalIssues;
    private long completedIssues;
    private long todoIssues;
    private long inProgressIssues;
    private long inReviewIssues;
    private long doneIssues;
    private Double progressPercentage;
}
