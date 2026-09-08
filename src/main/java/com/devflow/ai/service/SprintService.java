package com.devflow.ai.service;

import com.devflow.ai.dto.ProjectDTO;
import com.devflow.ai.dto.SprintDTO;
import com.devflow.ai.dto.SprintRequest;
import com.devflow.ai.exception.BadRequestException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.Issue;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.ProjectMember;
import com.devflow.ai.model.Sprint;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.IssueStatus;
import com.devflow.ai.model.enums.NotificationType;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository;
    private final ProjectService projectService;
    private final ProjectMemberRepository projectMemberRepository;
    private final AuthService authService;
    private final ProjectActivityService projectActivityService;
    private final NotificationService notificationService;
    private final ProjectAuthorizationService projectAuthorizationService;

    public List<SprintDTO> getAllAccessibleSprints() {
        List<ProjectDTO> projects = projectService.getMyProjects();
        List<SprintDTO> allSprints = new ArrayList<>();
        for (ProjectDTO p : projects) {
            List<SprintDTO> projectSprints = sprintRepository.findByProjectId(p.getId()).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            allSprints.addAll(projectSprints);
        }
        return allSprints;
    }

    public List<SprintDTO> getSprintsByProject(Long projectId) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        return sprintRepository.findByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SprintDTO getSprintById(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));
        projectService.verifyUserAccessToProject(sprint.getProject());
        return mapToDTO(sprint);
    }

    @Transactional
    public SprintDTO createSprint(Long projectIdParam, SprintRequest request) {
        Long targetProjectId = projectIdParam != null ? projectIdParam : request.getProjectId();
        if (targetProjectId == null) {
            throw new BadRequestException("Project ID is required to create a sprint");
        }

        Project project = projectService.getProjectEntity(targetProjectId);
        projectAuthorizationService.verifyCanManageSprint(project);
        User currentUser = authService.getCurrentUserEntity();

        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        SprintStatus targetStatus = request.getStatus() != null ? request.getStatus() : SprintStatus.PLANNED;
        if (targetStatus == SprintStatus.ACTIVE) {
            sprintRepository.findByProjectIdAndStatus(targetProjectId, SprintStatus.ACTIVE)
                    .ifPresent(activeSprint -> {
                        throw new BadRequestException("An active sprint already exists in this project: " + activeSprint.getName());
                    });
        }

        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .goal(request.getGoal())
                .project(project)
                .startDate(start)
                .endDate(end)
                .status(targetStatus)
                .createdAt(LocalDateTime.now())
                .build();

        Sprint savedSprint = sprintRepository.save(sprint);

        projectActivityService.logActivity(project, currentUser, "SPRINT_CREATED", "SPRINT", savedSprint.getId(), "created sprint '" + savedSprint.getName() + "'");

        if (targetStatus == SprintStatus.ACTIVE) {
            notifyMembersAboutSprint(project, currentUser, savedSprint, NotificationType.SPRINT_STARTED, "Sprint Started", "Sprint '" + savedSprint.getName() + "' has started in project '" + project.getName() + "'.");
        }

        return mapToDTO(savedSprint);
    }

    @Transactional
    public SprintDTO updateSprint(Long sprintId, SprintRequest request) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));

        projectAuthorizationService.verifyCanManageSprint(sprint.getProject());
        User currentUser = authService.getCurrentUserEntity();

        LocalDate start = request.getStartDate() != null ? request.getStartDate() : sprint.getStartDate();
        LocalDate end = request.getEndDate() != null ? request.getEndDate() : sprint.getEndDate();
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            sprint.setName(request.getName());
        }
        if (request.getGoal() != null) {
            sprint.setGoal(request.getGoal());
        }
        if (request.getStartDate() != null) {
            sprint.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            sprint.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null && request.getStatus() != sprint.getStatus()) {
            SprintStatus oldStatus = sprint.getStatus();
            if (request.getStatus() == SprintStatus.ACTIVE && oldStatus != SprintStatus.ACTIVE) {
                sprintRepository.findByProjectIdAndStatus(sprint.getProject().getId(), SprintStatus.ACTIVE)
                        .ifPresent(activeSprint -> {
                            throw new BadRequestException("An active sprint already exists in this project: " + activeSprint.getName());
                        });
            }
            sprint.setStatus(request.getStatus());

            if (request.getStatus() == SprintStatus.ACTIVE) {
                projectActivityService.logActivity(sprint.getProject(), currentUser, "SPRINT_STARTED", "SPRINT", sprint.getId(), "started sprint '" + sprint.getName() + "'");
                notifyMembersAboutSprint(sprint.getProject(), currentUser, sprint, NotificationType.SPRINT_STARTED, "Sprint Started", "Sprint '" + sprint.getName() + "' has started in project '" + sprint.getProject().getName() + "'.");
            } else if (request.getStatus() == SprintStatus.COMPLETED) {
                projectActivityService.logActivity(sprint.getProject(), currentUser, "SPRINT_COMPLETED", "SPRINT", sprint.getId(), "completed sprint '" + sprint.getName() + "'");
                notifyMembersAboutSprint(sprint.getProject(), currentUser, sprint, NotificationType.SPRINT_COMPLETED, "Sprint Completed", "Sprint '" + sprint.getName() + "' has been completed in project '" + sprint.getProject().getName() + "'.");
            }
        }

        Sprint updatedSprint = sprintRepository.save(sprint);
        return mapToDTO(updatedSprint);
    }

    @Transactional
    public void deleteSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + sprintId));

        projectAuthorizationService.verifyCanManageSprint(sprint.getProject());
        User currentUser = authService.getCurrentUserEntity();

        projectActivityService.logActivity(sprint.getProject(), currentUser, "SPRINT_DELETED", "SPRINT", sprintId, "deleted sprint '" + sprint.getName() + "'");

        // Unassign sprint from issues without deleting the issues
        List<Issue> issues = issueRepository.findBySprintId(sprintId);
        for (Issue issue : issues) {
            issue.setSprint(null);
            issueRepository.save(issue);
        }

        sprintRepository.delete(sprint);
    }

    private void notifyMembersAboutSprint(Project project, User actor, Sprint sprint, NotificationType type, String title, String message) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(project.getId());
        for (ProjectMember m : members) {
            notificationService.sendNotification(m.getUser(), actor, type, title, message, "SPRINT", sprint.getId());
        }
        if (project.getOwner() != null) {
            notificationService.sendNotification(project.getOwner(), actor, type, title, message, "SPRINT", sprint.getId());
        }
    }

    public SprintDTO mapToDTO(Sprint sprint) {
        if (sprint == null) return null;

        List<Issue> sprintIssues = issueRepository.findBySprintId(sprint.getId());
        long totalIssues = sprintIssues.size();
        long todoIssues = sprintIssues.stream().filter(i -> i.getStatus() == IssueStatus.TODO).count();
        long inProgressIssues = sprintIssues.stream().filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count();
        long inReviewIssues = sprintIssues.stream().filter(i -> i.getStatus() == IssueStatus.IN_REVIEW).count();
        long doneIssues = sprintIssues.stream().filter(i -> i.getStatus() == IssueStatus.DONE).count();
        long completedIssues = doneIssues;

        Double progressPercentage = null;
        if (totalIssues > 0) {
            progressPercentage = Math.round(((double) doneIssues / totalIssues * 100.0) * 10.0) / 10.0;
        }

        return SprintDTO.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .projectId(sprint.getProject().getId())
                .projectName(sprint.getProject().getName())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .createdAt(sprint.getCreatedAt())
                .totalIssues(totalIssues)
                .completedIssues(completedIssues)
                .todoIssues(todoIssues)
                .inProgressIssues(inProgressIssues)
                .inReviewIssues(inReviewIssues)
                .doneIssues(doneIssues)
                .progressPercentage(progressPercentage)
                .build();
    }
}
