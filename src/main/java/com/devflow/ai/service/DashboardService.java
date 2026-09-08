package com.devflow.ai.service;

import com.devflow.ai.dto.DashboardDTO;
import com.devflow.ai.dto.IssueDTO;
import com.devflow.ai.dto.ProjectDTO;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.IssuePriority;
import com.devflow.ai.model.enums.IssueStatus;
import com.devflow.ai.repository.IssueRepository;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.ProjectRepository;
import com.devflow.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final IssueService issueService;
    private final AuthService authService;

    public DashboardDTO getDashboardStats() {
        User currentUser = authService.getCurrentUserEntity();

        List<ProjectDTO> projects = projectService.getMyProjects();
        List<IssueDTO> assignedIssues = issueService.getMyAssignedIssues();

        long totalProjects = projects.size();
        long totalIssues = issueRepository.count();
        long todoIssues = issueRepository.findAll().stream()
                .filter(i -> i.getStatus() == IssueStatus.TODO)
                .count();
        long inProgressIssues = issueRepository.findAll().stream()
                .filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS)
                .count();
        long inReviewIssues = issueRepository.findAll().stream()
                .filter(i -> i.getStatus() == IssueStatus.IN_REVIEW)
                .count();
        long doneIssues = issueRepository.findAll().stream()
                .filter(i -> i.getStatus() == IssueStatus.DONE)
                .count();
        long openIssues = todoIssues + inProgressIssues + inReviewIssues;

        long criticalPriorityIssues = issueRepository.findAll().stream()
                .filter(i -> i.getPriority() == IssuePriority.CRITICAL)
                .count();
        long highPriorityIssues = issueRepository.findAll().stream()
                .filter(i -> i.getPriority() == IssuePriority.HIGH)
                .count();
        long mediumPriorityIssues = issueRepository.findAll().stream()
                .filter(i -> i.getPriority() == IssuePriority.MEDIUM)
                .count();
        long lowPriorityIssues = issueRepository.findAll().stream()
                .filter(i -> i.getPriority() == IssuePriority.LOW)
                .count();

        // Unique project members across user's accessible projects
        List<Long> projectIds = projects.stream().map(ProjectDTO::getId).collect(Collectors.toList());
        long uniqueMembersCount = 0;
        if (!projectIds.isEmpty()) {
            uniqueMembersCount = projectMemberRepository.findAll().stream()
                    .filter(pm -> projectIds.contains(pm.getProject().getId()))
                    .map(pm -> pm.getUser().getId())
                    .distinct()
                    .count();
        }

        List<ProjectDTO> recentProjects = projects.stream().limit(5).collect(Collectors.toList());

        return DashboardDTO.builder()
                .totalProjects(totalProjects)
                .totalIssues(totalIssues)
                .todoIssues(todoIssues)
                .openIssues(openIssues)
                .inProgressIssues(inProgressIssues)
                .inReviewIssues(inReviewIssues)
                .doneIssues(doneIssues)
                .criticalPriorityIssues(criticalPriorityIssues)
                .highPriorityIssues(highPriorityIssues)
                .mediumPriorityIssues(mediumPriorityIssues)
                .lowPriorityIssues(lowPriorityIssues)
                .totalMembers(uniqueMembersCount)
                .myAssignedIssuesCount(assignedIssues.size())
                .myAssignedIssues(assignedIssues)
                .recentProjects(recentProjects)
                .build();
    }
}
