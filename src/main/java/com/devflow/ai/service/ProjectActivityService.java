package com.devflow.ai.service;

import com.devflow.ai.dto.ProjectActivityDTO;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.ProjectActivity;
import com.devflow.ai.model.User;
import com.devflow.ai.repository.ProjectActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectActivityService {

    private final ProjectActivityRepository projectActivityRepository;
    private final ProjectService projectService;
    private final AuthService authService;

    @Transactional
    public void logActivity(Project project, User actor, String actionType, String entityType, Long entityId, String description) {
        if (project == null || actor == null) return;

        ProjectActivity activity = ProjectActivity.builder()
                .project(project)
                .actor(actor)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();

        projectActivityRepository.save(activity);
    }

    public List<ProjectActivityDTO> getActivityByProject(Long projectId) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        return projectActivityRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProjectActivityDTO mapToDTO(ProjectActivity activity) {
        if (activity == null) return null;
        return ProjectActivityDTO.builder()
                .id(activity.getId())
                .projectId(activity.getProject().getId())
                .actor(authService.mapToUserDTO(activity.getActor()))
                .actionType(activity.getActionType())
                .entityType(activity.getEntityType())
                .entityId(activity.getEntityId())
                .description(activity.getDescription())
                .createdAt(activity.getCreatedAt())
                .build();
    }
}
