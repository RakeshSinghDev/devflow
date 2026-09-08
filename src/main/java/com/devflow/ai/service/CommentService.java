package com.devflow.ai.service;

import com.devflow.ai.dto.CommentDTO;
import com.devflow.ai.dto.CommentRequest;
import com.devflow.ai.exception.ForbiddenException;
import com.devflow.ai.exception.ResourceNotFoundException;
import com.devflow.ai.model.Comment;
import com.devflow.ai.model.Issue;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.NotificationType;
import com.devflow.ai.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueService issueService;
    private final ProjectService projectService;
    private final AuthService authService;
    private final IssueActivityService issueActivityService;
    private final ProjectActivityService projectActivityService;
    private final NotificationService notificationService;
    private final ProjectAuthorizationService projectAuthorizationService;

    public List<CommentDTO> getCommentsByIssue(Long issueId) {
        Issue issue = issueService.getIssueEntity(issueId);
        projectService.verifyUserAccessToProject(issue.getProject());

        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO addComment(Long issueId, CommentRequest request) {
        Issue issue = issueService.getIssueEntity(issueId);
        projectService.verifyUserAccessToProject(issue.getProject());

        User currentUser = authService.getCurrentUserEntity();

        Comment comment = Comment.builder()
                .content(request.getContent())
                .issue(issue)
                .user(currentUser)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Comment savedComment = commentRepository.save(comment);

        issueActivityService.logActivity(issue, currentUser, "COMMENT_ADDED", "added a comment");
        projectActivityService.logActivity(issue.getProject(), currentUser, "COMMENT_CREATED", "ISSUE", issue.getId(), "commented on issue '" + issue.getTitle() + "'");

        if (issue.getAssignee() != null) {
            notificationService.sendNotification(
                    issue.getAssignee(),
                    currentUser,
                    NotificationType.ISSUE_COMMENTED,
                    "New Comment",
                    currentUser.getName() + " commented on issue '" + issue.getTitle() + "'",
                    "ISSUE",
                    issue.getId()
            );
        }
        if (issue.getCreatedBy() != null && (issue.getAssignee() == null || !issue.getCreatedBy().getId().equals(issue.getAssignee().getId()))) {
            notificationService.sendNotification(
                    issue.getCreatedBy(),
                    currentUser,
                    NotificationType.ISSUE_COMMENTED,
                    "New Comment",
                    currentUser.getName() + " commented on issue '" + issue.getTitle() + "'",
                    "ISSUE",
                    issue.getId()
            );
        }

        return mapToDTO(savedComment);
    }

    @Transactional
    public CommentDTO updateComment(Long commentId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        projectAuthorizationService.verifyCanModifyComment(comment);
        User currentUser = authService.getCurrentUserEntity();

        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        Comment updatedComment = commentRepository.save(comment);

        issueActivityService.logActivity(comment.getIssue(), currentUser, "COMMENT_EDITED", "edited a comment");
        projectActivityService.logActivity(comment.getIssue().getProject(), currentUser, "COMMENT_UPDATED", "ISSUE", comment.getIssue().getId(), "edited comment on issue '" + comment.getIssue().getTitle() + "'");

        return mapToDTO(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        projectAuthorizationService.verifyCanDeleteComment(comment);
        User currentUser = authService.getCurrentUserEntity();

        issueActivityService.logActivity(comment.getIssue(), currentUser, "COMMENT_DELETED", "deleted a comment");
        projectActivityService.logActivity(comment.getIssue().getProject(), currentUser, "COMMENT_DELETED", "ISSUE", comment.getIssue().getId(), "deleted comment on issue '" + comment.getIssue().getTitle() + "'");

        commentRepository.delete(comment);
    }

    public CommentDTO mapToDTO(Comment comment) {
        if (comment == null) return null;
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .issueId(comment.getIssue().getId())
                .user(authService.mapToUserDTO(comment.getUser()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
