package com.devflow.ai.dto;

import com.devflow.ai.model.enums.SprintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintAnalyticsDTO {
    private Long sprintId;
    private String name;
    private SprintStatus status;
    private long totalIssues;
    private long completedIssues;
    private double completionPercentage;
}
