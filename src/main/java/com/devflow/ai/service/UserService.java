package com.devflow.ai.service;

import com.devflow.ai.dto.ChangePasswordRequest;
import com.devflow.ai.dto.UpdateProfileRequest;
import com.devflow.ai.dto.UserDTO;
import com.devflow.ai.exception.BadRequestException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.Issue;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.User;
import com.devflow.ai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final IssueActivityRepository issueActivityRepository;
    private final ProjectActivityRepository projectActivityRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> searchUsers(String query) {
        String trimmedQuery = (query != null) ? query.trim() : "";
        if (trimmedQuery.isEmpty()) {
            return userRepository.findAll().stream()
                    .map(authService::mapToUserDTO)
                    .collect(Collectors.toList());
        }
        return userRepository.searchByNameOrEmail(trimmedQuery).stream()
                .map(authService::mapToUserDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getCurrentUser() {
        return authService.getCurrentUser();
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return authService.mapToUserDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(UpdateProfileRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        if (request.getName() != null && !request.getName().isBlank()) {
            currentUser.setName(request.getName());
        }
        currentUser.setJobTitle(request.getJobTitle());
        currentUser.setBio(request.getBio());
        currentUser.setTimezone(request.getTimezone());

        User updated = userRepository.save(currentUser);
        return authService.mapToUserDTO(updated);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }

    @Transactional
    public void deleteMyAccount() {
        User currentUser = authService.getCurrentUserEntity();
        Long userId = currentUser.getId();

        // 1. Unassign issues assigned to this user
        List<Issue> assigned = issueRepository.findByAssigneeId(userId);
        for (Issue issue : assigned) {
            issue.setAssignee(null);
            issueRepository.save(issue);
        }

        // 2. Re-parent issues created by this user in projects owned by others to project owner
        List<Issue> created = issueRepository.findByCreatedById(userId);
        for (Issue issue : created) {
            if (!issue.getProject().getOwner().getId().equals(userId)) {
                issue.setCreatedBy(issue.getProject().getOwner());
                issueRepository.save(issue);
            }
        }

        // 3. Remove comments, notifications, and activity logs associated with this user
        commentRepository.deleteByUserId(userId);
        notificationRepository.deleteByRecipientId(userId);
        issueActivityRepository.deleteByUserId(userId);
        projectActivityRepository.deleteByActorId(userId);

        // 4. Remove project memberships
        projectMemberRepository.deleteByUserId(userId);

        // 5. Delete projects owned by user
        List<Project> owned = projectRepository.findByOwnerId(userId);
        for (Project p : owned) {
            projectRepository.delete(p);
        }

        // 6. Delete user account
        userRepository.delete(currentUser);
    }
}
