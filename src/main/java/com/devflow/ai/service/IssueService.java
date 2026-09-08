package com.devflow.ai.service;

import com.devflow.ai.dto.IssueDTO;
import com.devflow.ai.dto.IssueRequest;
import com.devflow.ai.exception.BadRequestException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.Issue;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.Sprint;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.IssuePriority;
import com.devflow.ai.model.enums.IssueStatus;
import com.devflow.ai.model.enums.NotificationType;
import com.devflow.ai.repository.IssueRepository;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.SprintRepository;
import com.devflow.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectService projectService;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;
    private final AuthService authService;
    private final IssueActivityService issueActivityService;
    private final ProjectActivityService projectActivityService;
    private final NotificationService notificationService;
    private final ProjectAuthorizationService projectAuthorizationService;

    public List<IssueDTO> getIssuesByProject(Long projectId) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        return issueRepository.findByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssuesBySprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));
        projectAuthorizationService.verifyCanViewProject(sprint.getProject());

        return issueRepository.findBySprintId(sprintId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getMyAssignedIssues() {
        User currentUser = authService.getCurrentUserEntity();
        return issueRepository.findByAssigneeId(currentUser.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public IssueDTO getIssueById(Long id) {
        Issue issue = getIssueEntity(id);
        projectService.verifyUserAccessToProject(issue.getProject());
        return mapToDTO(issue);
    }

    @Transactional
    public IssueDTO createIssue(Long projectId, IssueRequest request) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        User currentUser = authService.getCurrentUserEntity();

        User assignee = null;
        if (request.getAssigneeId() != null && request.getAssigneeId() > 0) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
            
            boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, assignee.getId());
            if (!isMember) {
                throw new BadRequestException("Cannot assign issue to user who is not a member of this project");
            }
        }

        Sprint sprint = null;
        if (request.getSprintId() != null && request.getSprintId() > 0) {
            sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));
            if (!sprint.getProject().getId().equals(projectId)) {
                throw new BadRequestException("Sprint does not belong to this project");
            }
        }

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : IssueStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM)
                .project(project)
                .createdBy(currentUser)
                .assignee(assignee)
                .sprint(sprint)
                .dueDate(request.getDueDate())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Issue savedIssue = issueRepository.save(issue);

        issueActivityService.logActivity(savedIssue, currentUser, "ISSUE_CREATED", "created this issue");
        projectActivityService.logActivity(project, currentUser, "ISSUE_CREATED", "ISSUE", savedIssue.getId(), "created issue '" + savedIssue.getTitle() + "'");

        if (assignee != null) {
            notificationService.sendNotification(
                    assignee,
                    currentUser,
                    NotificationType.ISSUE_ASSIGNED,
                    "Task Assigned",
                    currentUser.getName() + " assigned issue '" + savedIssue.getTitle() + "' to you.",
                    "ISSUE",
                    savedIssue.getId()
            );
        }

        return mapToDTO(savedIssue);
    }

    @Transactional
    public IssueDTO updateIssue(Long id, IssueRequest request) {
        Issue issue = getIssueEntity(id);
        projectService.verifyUserAccessToProject(issue.getProject());
        User currentUser = authService.getCurrentUserEntity();

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            issue.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            issue.setDescription(request.getDescription());
        }
        if (request.getStatus() != null && request.getStatus() != issue.getStatus()) {
            IssueStatus oldStatus = issue.getStatus();
            issue.setStatus(request.getStatus());
            issueActivityService.logActivity(issue, currentUser, "STATUS_CHANGED", "changed status from " + oldStatus + " to " + request.getStatus());
            projectActivityService.logActivity(issue.getProject(), currentUser, "ISSUE_STATUS_CHANGED", "ISSUE", issue.getId(), "moved issue '" + issue.getTitle() + "' to " + request.getStatus());
            
            if (issue.getAssignee() != null) {
                notificationService.sendNotification(
                        issue.getAssignee(),
                        currentUser,
                        NotificationType.ISSUE_STATUS_CHANGED,
                        "Task Status Updated",
                        currentUser.getName() + " changed status of '" + issue.getTitle() + "' to " + request.getStatus(),
                        "ISSUE",
                        issue.getId()
                );
            }
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        if (request.getAssigneeId() != null) {
            if (request.getAssigneeId() <= 0) {
                issue.setAssignee(null);
                issueActivityService.logActivity(issue, currentUser, "ASSIGNEE_CHANGED", "unassigned this issue");
                projectActivityService.logActivity(issue.getProject(), currentUser, "ISSUE_UNASSIGNED", "ISSUE", issue.getId(), "unassigned issue '" + issue.getTitle() + "'");
            } else {
                User assignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
                boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(issue.getProject().getId(), assignee.getId());
                if (!isMember) {
                    throw new BadRequestException("Cannot assign issue to user who is not a member of this project");
                }
                issue.setAssignee(assignee);
                issueActivityService.logActivity(issue, currentUser, "ASSIGNEE_CHANGED", "assigned this issue to " + assignee.getName());
                projectActivityService.logActivity(issue.getProject(), currentUser, "ISSUE_ASSIGNED", "ISSUE", issue.getId(), "assigned issue '" + issue.getTitle() + "' to " + assignee.getName());

                notificationService.sendNotification(
                        assignee,
                        currentUser,
                        NotificationType.ISSUE_ASSIGNED,
                        "Task Assigned",
                        currentUser.getName() + " assigned issue '" + issue.getTitle() + "' to you.",
                        "ISSUE",
                        issue.getId()
                );
            }
        }
        if (request.getSprintId() != null) {
            if (request.getSprintId() <= 0) {
                issue.setSprint(null);
            } else {
                Sprint sprint = sprintRepository.findById(request.getSprintId())
                        .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));
                if (!sprint.getProject().getId().equals(issue.getProject().getId())) {
                    throw new BadRequestException("Sprint does not belong to this project");
                }
                issue.setSprint(sprint);
            }
        }
        if (request.getDueDate() != null) {
            issue.setDueDate(request.getDueDate());
        }
        issue.setUpdatedAt(LocalDateTime.now());

        Issue updatedIssue = issueRepository.save(issue);
        return mapToDTO(updatedIssue);
    }

    @Transactional
    public IssueDTO updateIssueStatus(Long id, IssueStatus status) {
        Issue issue = getIssueEntity(id);
        projectService.verifyUserAccessToProject(issue.getProject());
        User currentUser = authService.getCurrentUserEntity();

        IssueStatus oldStatus = issue.getStatus();
        if (oldStatus != status) {
            issue.setStatus(status);
            issue.setUpdatedAt(LocalDateTime.now());
            issueActivityService.logActivity(issue, currentUser, "STATUS_CHANGED", "changed status from " + oldStatus + " to " + status);
            projectActivityService.logActivity(issue.getProject(), currentUser, "ISSUE_STATUS_CHANGED", "ISSUE", issue.getId(), "moved issue '" + issue.getTitle() + "' to " + status);

            if (issue.getAssignee() != null) {
                notificationService.sendNotification(
                        issue.getAssignee(),
                        currentUser,
                        NotificationType.ISSUE_STATUS_CHANGED,
                        "Task Status Updated",
                        currentUser.getName() + " changed status of '" + issue.getTitle() + "' to " + status,
                        "ISSUE",
                        issue.getId()
                );
            }
        }

        Issue updatedIssue = issueRepository.save(issue);
        return mapToDTO(updatedIssue);
    }

    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = getIssueEntity(id);
        projectAuthorizationService.verifyCanDeleteIssue(issue);
        User currentUser = authService.getCurrentUserEntity();

        projectActivityService.logActivity(issue.getProject(), currentUser, "ISSUE_DELETED", "ISSUE", issue.getId(), "deleted issue '" + issue.getTitle() + "'");
        issueRepository.delete(issue);
    }

    public Issue getIssueEntity(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));
    }

    public IssueDTO mapToDTO(Issue issue) {
        if (issue == null) return null;
        return IssueDTO.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .projectId(issue.getProject().getId())
                .assignee(issue.getAssignee() != null ? authService.mapToUserDTO(issue.getAssignee()) : null)
                .createdBy(authService.mapToUserDTO(issue.getCreatedBy()))
                .sprintId(issue.getSprint() != null ? issue.getSprint().getId() : null)
                .sprintName(issue.getSprint() != null ? issue.getSprint().getName() : null)
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .dueDate(issue.getDueDate())
                .build();
    }
}
