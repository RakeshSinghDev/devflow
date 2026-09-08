package com.devflow.ai.service;

import com.devflow.ai.dto.*;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.ProjectMember;
import com.devflow.ai.model.Sprint;
import com.devflow.ai.model.enums.IssuePriority;
import com.devflow.ai.model.enums.IssueStatus;
import com.devflow.ai.model.enums.SprintStatus;
import com.devflow.ai.repository.IssueRepository;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectAnalyticsService {

    private final ProjectService projectService;
    private final IssueRepository issueRepository;
    private final SprintRepository sprintRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional(readOnly = true)
    public ProjectAnalyticsResponse getProjectAnalytics(Long projectId) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        long totalIssues = issueRepository.countByProjectId(projectId);
        long todoIssues = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.TODO);
        long inProgressIssues = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.IN_PROGRESS);
        long inReviewIssues = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.IN_REVIEW);
        long doneIssues = issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.DONE);

        double completionPercentage = 0.0;
        if (totalIssues > 0) {
            completionPercentage = Math.round(((double) doneIssues / totalIssues) * 100.0 * 10.0) / 10.0;
        }

        long overdueIssues = issueRepository.countByProjectIdAndDueDateBeforeAndStatusNot(projectId, LocalDate.now(), IssueStatus.DONE);
        long unassignedIssues = issueRepository.countByProjectIdAndAssigneeIsNull(projectId);

        long lowPriorityIssues = issueRepository.countByProjectIdAndPriority(projectId, IssuePriority.LOW);
        long mediumPriorityIssues = issueRepository.countByProjectIdAndPriority(projectId, IssuePriority.MEDIUM);
        long highPriorityIssues = issueRepository.countByProjectIdAndPriority(projectId, IssuePriority.HIGH);
        long criticalPriorityIssues = issueRepository.countByProjectIdAndPriority(projectId, IssuePriority.CRITICAL);

        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        long totalMembers = members.size();

        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        long totalSprints = sprints.size();
        long activeSprints = sprints.stream().filter(s -> s != null && s.getStatus() == SprintStatus.ACTIVE).count();
        long completedSprints = sprints.stream().filter(s -> s != null && s.getStatus() == SprintStatus.COMPLETED).count();
        long plannedSprints = sprints.stream().filter(s -> s != null && s.getStatus() == SprintStatus.PLANNED).count();

        List<SprintAnalyticsDTO> sprintAnalytics = new ArrayList<>();
        for (Sprint sprint : sprints) {
            if (sprint == null) continue;
            long sprintTotal = issueRepository.countByProjectIdAndSprintId(projectId, sprint.getId());
            long sprintCompleted = issueRepository.countByProjectIdAndSprintIdAndStatus(projectId, sprint.getId(), IssueStatus.DONE);
            double sprintPercentage = 0.0;
            if (sprintTotal > 0) {
                sprintPercentage = Math.round(((double) sprintCompleted / sprintTotal) * 100.0 * 10.0) / 10.0;
            }
            sprintAnalytics.add(SprintAnalyticsDTO.builder()
                    .sprintId(sprint.getId())
                    .name(sprint.getName())
                    .status(sprint.getStatus())
                    .totalIssues(sprintTotal)
                    .completedIssues(sprintCompleted)
                    .completionPercentage(sprintPercentage)
                    .build());
        }

        List<MemberWorkloadDTO> memberWorkload = new ArrayList<>();
        for (ProjectMember member : members) {
            if (member == null || member.getUser() == null) continue;
            long assigned = issueRepository.countByProjectIdAndAssigneeId(projectId, member.getUser().getId());
            long completed = issueRepository.countByProjectIdAndAssigneeIdAndStatus(projectId, member.getUser().getId(), IssueStatus.DONE);
            double memberPercentage = 0.0;
            if (assigned > 0) {
                memberPercentage = Math.round(((double) completed / assigned) * 100.0 * 10.0) / 10.0;
            }
            memberWorkload.add(MemberWorkloadDTO.builder()
                    .userId(member.getUser().getId())
                    .name(member.getUser().getName())
                    .email(member.getUser().getEmail())
                    .role(member.getRole())
                    .assignedIssues(assigned)
                    .completedIssues(completed)
                    .completionPercentage(memberPercentage)
                    .build());
        }

        // Calculate Project Health Deterministically
        ProjectHealthDTO health = calculateProjectHealth(totalIssues, doneIssues, overdueIssues, completionPercentage);

        return ProjectAnalyticsResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .totalIssues(totalIssues)
                .todoIssues(todoIssues)
                .inProgressIssues(inProgressIssues)
                .inReviewIssues(inReviewIssues)
                .doneIssues(doneIssues)
                .completionPercentage(completionPercentage)
                .totalMembers(totalMembers)
                .totalSprints(totalSprints)
                .activeSprints(activeSprints)
                .completedSprints(completedSprints)
                .plannedSprints(plannedSprints)
                .overdueIssues(overdueIssues)
                .unassignedIssues(unassignedIssues)
                .lowPriorityIssues(lowPriorityIssues)
                .mediumPriorityIssues(mediumPriorityIssues)
                .highPriorityIssues(highPriorityIssues)
                .criticalPriorityIssues(criticalPriorityIssues)
                .sprintAnalytics(sprintAnalytics)
                .memberWorkload(memberWorkload)
                .health(health)
                .build();
    }

    private ProjectHealthDTO calculateProjectHealth(long totalIssues, long doneIssues, long overdueIssues, double completionPercentage) {
        if (totalIssues == 0) {
            return new ProjectHealthDTO("NO_DATA", "No task data recorded yet.");
        }
        if (doneIssues == totalIssues) {
            return new ProjectHealthDTO("COMPLETED", "All " + totalIssues + " project task(s) have been completed.");
        }
        if (overdueIssues > 0) {
            return new ProjectHealthDTO("AT_RISK", overdueIssues + " task(s) are overdue and require immediate attention.");
        }
        if (totalIssues >= 5 && completionPercentage < 30.0) {
            return new ProjectHealthDTO("AT_RISK", "Low completion percentage (" + String.format("%.1f", completionPercentage) + "%).");
        }
        return new ProjectHealthDTO("HEALTHY", "Project progress is on track (" + String.format("%.1f", completionPercentage) + "% completed, 0 overdue).");
    }
}
