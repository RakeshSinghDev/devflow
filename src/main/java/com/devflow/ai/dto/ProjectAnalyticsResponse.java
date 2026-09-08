package com.devflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAnalyticsResponse {
    private Long projectId;
    private String projectName;

    // Issue Status Counts
    private long totalIssues;
    private long todoIssues;
    private long inProgressIssues;
    private long inReviewIssues;
    private long doneIssues;
    private double completionPercentage;

    // Project Metadata Counts
    private long totalMembers;
    private long totalSprints;
    private long activeSprints;
    private long completedSprints;
    private long plannedSprints;

    // Issue Special Counts
    private long overdueIssues;
    private long unassignedIssues;

    // Priority Breakdown
    private long lowPriorityIssues;
    private long mediumPriorityIssues;
    private long highPriorityIssues;
    private long criticalPriorityIssues;

    // Nested Breakdowns
    private List<SprintAnalyticsDTO> sprintAnalytics;
    private List<MemberWorkloadDTO> memberWorkload;
    private ProjectHealthDTO health;
}
