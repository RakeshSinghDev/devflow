package com.devflow.ai.service;

import com.devflow.ai.dto.ProjectDTO;
import com.devflow.ai.dto.ProjectRequest;
import com.devflow.ai.exception.BadRequestException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.ProjectMember;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.ProjectStatus;
import com.devflow.ai.model.enums.UserRole;
import com.devflow.ai.repository.IssueRepository;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final ProjectAuthorizationService projectAuthorizationService;

    @Transactional
    public ProjectDTO createProject(ProjectRequest request) {
        User currentUser = authService.getCurrentUserEntity();

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Project savedProject = projectRepository.save(project);

        // Explicitly add owner as project member with ADMIN role
        ProjectMember ownerMember = ProjectMember.builder()
                .project(savedProject)
                .user(currentUser)
                .role(UserRole.ADMIN)
                .joinedAt(LocalDateTime.now())
                .build();

        projectMemberRepository.save(ownerMember);

        return mapToDTO(savedProject);
    }

    public List<ProjectDTO> getMyProjects() {
        User currentUser = authService.getCurrentUserEntity();
        List<Project> projects = projectRepository.findProjectsByUserId(currentUser.getId());
        return projects.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(Long id) {
        Project project = getProjectEntity(id);
        verifyUserAccessToProject(project);
        return mapToDTO(project);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectRequest request) {
        Project project = getProjectEntity(id);
        verifyOwnerOrAdminAccess(project);

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setUpdatedAt(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);
        return mapToDTO(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectEntity(id);
        verifyOwnerOrAdminAccess(project);
        projectRepository.delete(project);
    }

    public Project getProjectEntity(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    public void verifyUserAccessToProject(Project project) {
        projectAuthorizationService.verifyCanViewProject(project);
    }

    public void verifyOwnerOrAdminAccess(Project project) {
        projectAuthorizationService.verifyCanManageProject(project);
    }

    public ProjectDTO mapToDTO(Project project) {
        long memberCount = projectMemberRepository.findByProjectId(project.getId()).size();
        long issueCount = issueRepository.countByProjectId(project.getId());
        long doneIssueCount = issueRepository.countByProjectIdAndStatus(project.getId(), com.devflow.ai.model.enums.IssueStatus.DONE);

        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .owner(authService.mapToUserDTO(project.getOwner()))
                .status(project.getStatus())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .memberCount(memberCount)
                .issueCount(issueCount)
                .doneIssueCount(doneIssueCount)
                .build();
    }
}
