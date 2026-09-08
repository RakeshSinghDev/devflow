package com.devflow.ai.service;

import com.devflow.ai.dto.CommentDTO;
import com.devflow.ai.dto.CommentRequest;
import com.devflow.ai.exception.ForbiddenException;
import com.devflow.ai.model.Comment;
import com.devflow.ai.model.Issue;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.User;
import com.devflow.ai.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private IssueService issueService;

    @Mock
    private ProjectService projectService;

    @Mock
    private AuthService authService;

    @Mock
    private IssueActivityService issueActivityService;

    @Mock
    private ProjectActivityService projectActivityService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ProjectAuthorizationService projectAuthorizationService;

    @InjectMocks
    private CommentService commentService;

    private User user1;
    private User user2;
    private Project project;
    private Issue issue;
    private Comment comment;

    @BeforeEach
    void setUp() {
        user1 = User.builder().id(1L).name("User One").email("user1@example.com").build();
        user2 = User.builder().id(2L).name("User Two").email("user2@example.com").build();

        project = Project.builder().id(100L).name("Demo Project").build();
        issue = Issue.builder().id(500L).title("Test Issue").project(project).createdBy(user1).build();

        comment = Comment.builder()
                .id(10L)
                .content("Original content")
                .issue(issue)
                .user(user1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void updateComment_asAuthor_shouldSucceed() {
        when(commentRepository.findById(10L)).thenReturn(Optional.of(comment));
        when(authService.getCurrentUserEntity()).thenReturn(user1);
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));

        CommentRequest request = new CommentRequest("Updated content");
        CommentDTO updated = commentService.updateComment(10L, request);

        assertNotNull(updated);
        assertEquals("Updated content", updated.getContent());
        verify(issueActivityService, times(1)).logActivity(eq(issue), eq(user1), eq("COMMENT_EDITED"), anyString());
    }

    @Test
    void updateComment_asNonAuthor_shouldThrowForbiddenException() {
        when(commentRepository.findById(10L)).thenReturn(Optional.of(comment));
        doThrow(new ForbiddenException("You can only edit your own comments"))
                .when(projectAuthorizationService).verifyCanModifyComment(comment);

        CommentRequest request = new CommentRequest("Unauthorized update");

        assertThrows(ForbiddenException.class, () -> commentService.updateComment(10L, request));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void deleteComment_asNonAuthor_shouldThrowForbiddenException() {
        when(commentRepository.findById(10L)).thenReturn(Optional.of(comment));
        doThrow(new ForbiddenException("Access denied: You do not have permission to delete this comment"))
                .when(projectAuthorizationService).verifyCanDeleteComment(comment);

        assertThrows(ForbiddenException.class, () -> commentService.deleteComment(10L));
        verify(commentRepository, never()).delete(any(Comment.class));
    }
}
