package com.devflow.ai.service;

import com.devflow.ai.dto.AddMemberRequest;
import com.devflow.ai.dto.MemberProfileDTO;
import com.devflow.ai.dto.ProjectMemberDTO;
import com.devflow.ai.dto.UserDTO;
import com.devflow.ai.exception.BadRequestException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.ProjectMember;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.NotificationType;
import com.devflow.ai.model.enums.UserRole;
import com.devflow.ai.repository.IssueRepository;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final ProjectActivityService projectActivityService;
    private final NotificationService notificationService;
    private final ProjectAuthorizationService projectAuthorizationService;

    public List<ProjectMemberDTO> getMembers(Long projectId) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getAvailableMembers(Long projectId, String query) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        List<Long> currentMemberUserIds = projectMemberRepository.findByProjectId(projectId).stream()
                .map(pm -> pm.getUser().getId())
                .collect(Collectors.toList());

        if (project.getOwner() != null && !currentMemberUserIds.contains(project.getOwner().getId())) {
            currentMemberUserIds.add(project.getOwner().getId());
        }

        String trimmedQuery = (query != null) ? query.trim() : "";

        List<User> users = trimmedQuery.isEmpty()
                ? userRepository.findAll()
                : userRepository.searchByNameOrEmail(trimmedQuery);

        return users.stream()
                .filter(u -> !currentMemberUserIds.contains(u.getId()))
                .map(authService::mapToUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberDTO addMember(Long projectId, AddMemberRequest request) {
        Project project = projectService.getProjectEntity(projectId);
        projectAuthorizationService.verifyCanManageMembers(project);
        User currentUser = authService.getCurrentUserEntity();

        User userToAdd = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userToAdd.getId())) {
            throw new com.devflow.ai.exception.ConflictException("This user is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(userToAdd)
                .role(request.getRole() != null ? request.getRole() : UserRole.MEMBER)
                .joinedAt(LocalDateTime.now())
                .build();

        ProjectMember savedMember = projectMemberRepository.save(member);

        projectActivityService.logActivity(project, currentUser, "MEMBER_ADDED", "MEMBER", userToAdd.getId(), "added " + userToAdd.getName() + " to the project");
        notificationService.sendNotification(
                userToAdd,
                currentUser,
                NotificationType.PROJECT_MEMBER_ADDED,
                "Added to Project",
                "You were added to project '" + project.getName() + "' by " + currentUser.getName() + ".",
                "PROJECT",
                project.getId()
        );

        return mapToDTO(savedMember);
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        Project project = projectService.getProjectEntity(projectId);
        projectAuthorizationService.verifyCanManageMembers(project);
        projectAuthorizationService.verifyOwnerNotRemoved(project, userId);
        User currentUser = authService.getCurrentUserEntity();

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));

        User removedUser = member.getUser();

        projectActivityService.logActivity(project, currentUser, "MEMBER_REMOVED", "MEMBER", removedUser.getId(), "removed " + removedUser.getName() + " from the project");
        notificationService.sendNotification(
                removedUser,
                currentUser,
                NotificationType.PROJECT_MEMBER_REMOVED,
                "Removed from Project",
                "You were removed from project '" + project.getName() + "'.",
                "PROJECT",
                project.getId()
        );

        projectMemberRepository.delete(member);
    }

    public MemberProfileDTO getMemberProfile(Long projectId, Long userId) {
        Project project = projectService.getProjectEntity(projectId);
        projectService.verifyUserAccessToProject(project);

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this project"));

        User user = member.getUser();
        long assignedCount = issueRepository.countByProjectIdAndAssigneeId(projectId, userId);
        long createdCount = issueRepository.countByProjectIdAndCreatedById(projectId, userId);

        return MemberProfileDTO.builder()
                .id(member.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .globalRole(user.getRole())
                .projectRole(member.getRole())
                .accountCreatedAt(user.getCreatedAt())
                .joinedProjectAt(member.getJoinedAt())
                .assignedIssueCount(assignedCount)
                .createdIssueCount(createdCount)
                .jobTitle(user.getJobTitle())
                .bio(user.getBio())
                .timezone(user.getTimezone())
                .build();
    }

    public ProjectMemberDTO mapToDTO(ProjectMember member) {
        return ProjectMemberDTO.builder()
                .id(member.getId())
                .projectId(member.getProject().getId())
                .user(authService.mapToUserDTO(member.getUser()))
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
