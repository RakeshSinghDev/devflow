package com.devflow.ai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {

    private long totalProjects;
    private long totalIssues;
    private long todoIssues;
    private long openIssues;
    private long inProgressIssues;
    private long inReviewIssues;
    private long doneIssues;
    private long criticalPriorityIssues;
    private long highPriorityIssues;
    private long mediumPriorityIssues;
    private long lowPriorityIssues;
    private long totalMembers;
    private long myAssignedIssuesCount;
    private List<IssueDTO> myAssignedIssues;
    private List<ProjectDTO> recentProjects;
}
