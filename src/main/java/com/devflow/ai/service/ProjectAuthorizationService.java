package com.devflow.ai.service;

import com.devflow.ai.exception.ForbiddenException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.*;
import com.devflow.ai.model.enums.UserRole;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectAuthorizationService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AuthService authService;

    public Project getProjectEntity(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
    }

    public User getCurrentUser() {
        return authService.getCurrentUserEntity();
    }

    public boolean isGlobalAdmin(User user) {
        return user != null && user.getRole() == UserRole.ADMIN;
    }

    public boolean isProjectOwner(Project project, User user) {
        return project != null && project.getOwner() != null && user != null
                && project.getOwner().getId().equals(user.getId());
    }

    public boolean isProjectMember(Long projectId, Long userId) {
        if (projectId == null || userId == null) return false;
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    public Optional<ProjectMember> getProjectMember(Long projectId, Long userId) {
        if (projectId == null || userId == null) return Optional.empty();
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
    }

    public boolean isProjectAdmin(Project project, User user) {
        if (project == null || user == null) return false;
        if (isGlobalAdmin(user) || isProjectOwner(project, user)) {
            return true;
        }
        return getProjectMember(project.getId(), user.getId())
                .map(m -> m.getRole() == UserRole.ADMIN)
                .orElse(false);
    }

    public void verifyCanViewProject(Project project) {
        User currentUser = getCurrentUser();
        if (isGlobalAdmin(currentUser) || isProjectOwner(project, currentUser) || isProjectMember(project.getId(), currentUser.getId())) {
            return;
        }
        throw new ForbiddenException("Access denied: You are not a member of this project");
    }

    public void verifyCanViewProject(Long projectId) {
        Project project = getProjectEntity(projectId);
        verifyCanViewProject(project);
    }

    public void verifyCanManageProject(Project project) {
        User currentUser = getCurrentUser();
        if (isGlobalAdmin(currentUser) || isProjectOwner(project, currentUser)) {
            return;
        }
        ProjectMember member = getProjectMember(project.getId(), currentUser.getId())
                .orElseThrow(() -> new ForbiddenException("Access denied: You are not a member of this project"));
        
        if (member.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Access denied: Only project owner or admins can modify project settings");
        }
    }

    public void verifyCanManageProject(Long projectId) {
        Project project = getProjectEntity(projectId);
        verifyCanManageProject(project);
    }

    public void verifyCanManageMembers(Project project) {
        User currentUser = getCurrentUser();
        if (isGlobalAdmin(currentUser) || isProjectOwner(project, currentUser)) {
            return;
        }
        ProjectMember member = getProjectMember(project.getId(), currentUser.getId())
                .orElseThrow(() -> new ForbiddenException("Access denied: You are not a member of this project"));

        if (member.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Access denied: Only project owner or admins can manage members");
        }
    }

    public void verifyCanManageMembers(Long projectId) {
        Project project = getProjectEntity(projectId);
        verifyCanManageMembers(project);
    }

    public void verifyCanManageSprint(Project project) {
        User currentUser = getCurrentUser();
        if (isGlobalAdmin(currentUser) || isProjectOwner(project, currentUser)) {
            return;
        }
        ProjectMember member = getProjectMember(project.getId(), currentUser.getId())
                .orElseThrow(() -> new ForbiddenException("Access denied: You are not a member of this project"));

        if (member.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Access denied: Only project owner or admins can manage sprints");
        }
    }

    public void verifyCanManageSprint(Long projectId) {
        Project project = getProjectEntity(projectId);
        verifyCanManageSprint(project);
    }

    public void verifyCanManageIssues(Project project) {
        verifyCanViewProject(project);
    }

    public void verifyCanManageIssues(Long projectId) {
        Project project = getProjectEntity(projectId);
        verifyCanManageIssues(project);
    }

    public void verifyCanDeleteIssue(Issue issue) {
        User currentUser = getCurrentUser();
        if (isGlobalAdmin(currentUser) || isProjectOwner(issue.getProject(), currentUser) || isProjectAdmin(issue.getProject(), currentUser)) {
            return;
        }
        if (issue.getCreatedBy() != null && issue.getCreatedBy().getId().equals(currentUser.getId())) {
            return;
        }
        if (issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId())) {
            return;
        }
        throw new ForbiddenException("Access denied: You do not have permission to delete this issue");
    }

    public void verifyCanModifyComment(Comment comment) {
        User currentUser = getCurrentUser();
        verifyCanViewProject(comment.getIssue().getProject());
        if (isGlobalAdmin(currentUser) || (comment.getUser() != null && comment.getUser().getId().equals(currentUser.getId()))) {
            return;
        }
        throw new ForbiddenException("You can only edit your own comments");
    }

    public void verifyCanDeleteComment(Comment comment) {
        User currentUser = getCurrentUser();
        verifyCanViewProject(comment.getIssue().getProject());
        if (isGlobalAdmin(currentUser) || isProjectOwner(comment.getIssue().getProject(), currentUser) 
                || isProjectAdmin(comment.getIssue().getProject(), currentUser)) {
            return;
        }
        if (comment.getUser() != null && comment.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        throw new ForbiddenException("Access denied: You do not have permission to delete this comment");
    }

    public void verifyOwnerNotRemoved(Project project, Long targetUserId) {
        if (project.getOwner() != null && project.getOwner().getId().equals(targetUserId)) {
            throw new ForbiddenException("Cannot remove the project owner from members");
        }
    }
}
