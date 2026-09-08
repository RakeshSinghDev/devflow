package com.devflow.ai.service;

import com.devflow.ai.dto.ProjectAnalyticsResponse;
import com.devflow.ai.exception.ForbiddenException;
import com.devflow.ai.model.Project;
import com.devflow.ai.model.ProjectMember;
import com.devflow.ai.model.User;
import com.devflow.ai.model.enums.IssuePriority;
import com.devflow.ai.model.enums.IssueStatus;
import com.devflow.ai.model.enums.UserRole;
import com.devflow.ai.repository.IssueRepository;
import com.devflow.ai.repository.ProjectMemberRepository;
import com.devflow.ai.repository.SprintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectAnalyticsServiceTest {

    @Mock
    private ProjectService projectService;

    @Mock
    private IssueRepository issueRepository;

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @InjectMocks
    private ProjectAnalyticsService projectAnalyticsService;

    private Project project;
    private User owner;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).name("Owner").email("owner@example.com").build();
        project = Project.builder().id(100L).name("Test Analytics Project").owner(owner).build();
    }

    @Test
    void getProjectAnalytics_withZeroIssues_shouldReturnNoDataHealth() {
        when(projectService.getProjectEntity(100L)).thenReturn(project);
        when(issueRepository.countByProjectId(100L)).thenReturn(0L);
        when(projectMemberRepository.findByProjectId(100L)).thenReturn(Collections.emptyList());
        when(sprintRepository.findByProjectId(100L)).thenReturn(Collections.emptyList());

        ProjectAnalyticsResponse response = projectAnalyticsService.getProjectAnalytics(100L);

        assertNotNull(response);
        assertEquals(0L, response.getTotalIssues());
        assertEquals(0.0, response.getCompletionPercentage());
        assertEquals("NO_DATA", response.getHealth().getStatus());
        verify(projectService, times(1)).verifyUserAccessToProject(project);
    }

    @Test
    void getProjectAnalytics_withAllDoneIssues_shouldReturnCompletedHealth() {
        when(projectService.getProjectEntity(100L)).thenReturn(project);
        when(issueRepository.countByProjectId(100L)).thenReturn(10L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.TODO)).thenReturn(0L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.IN_PROGRESS)).thenReturn(0L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.IN_REVIEW)).thenReturn(0L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.DONE)).thenReturn(10L);

        when(issueRepository.countByProjectIdAndDueDateBeforeAndStatusNot(eq(100L), any(java.time.LocalDate.class), eq(IssueStatus.DONE))).thenReturn(0L);
        when(issueRepository.countByProjectIdAndAssigneeIsNull(100L)).thenReturn(0L);

        when(projectMemberRepository.findByProjectId(100L)).thenReturn(Collections.emptyList());
        when(sprintRepository.findByProjectId(100L)).thenReturn(Collections.emptyList());

        ProjectAnalyticsResponse response = projectAnalyticsService.getProjectAnalytics(100L);

        assertNotNull(response);
        assertEquals(10L, response.getTotalIssues());
        assertEquals(10L, response.getDoneIssues());
        assertEquals(100.0, response.getCompletionPercentage());
        assertEquals("COMPLETED", response.getHealth().getStatus());
    }

    @Test
    void getProjectAnalytics_withOverdueIssues_shouldReturnAtRiskHealth() {
        when(projectService.getProjectEntity(100L)).thenReturn(project);
        when(issueRepository.countByProjectId(100L)).thenReturn(10L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.TODO)).thenReturn(5L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.IN_PROGRESS)).thenReturn(3L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.IN_REVIEW)).thenReturn(0L);
        when(issueRepository.countByProjectIdAndStatus(100L, IssueStatus.DONE)).thenReturn(2L);

        when(issueRepository.countByProjectIdAndDueDateBeforeAndStatusNot(eq(100L), any(java.time.LocalDate.class), eq(IssueStatus.DONE))).thenReturn(2L);
        when(issueRepository.countByProjectIdAndAssigneeIsNull(100L)).thenReturn(1L);

        when(projectMemberRepository.findByProjectId(100L)).thenReturn(Collections.emptyList());
        when(sprintRepository.findByProjectId(100L)).thenReturn(Collections.emptyList());

        ProjectAnalyticsResponse response = projectAnalyticsService.getProjectAnalytics(100L);

        assertNotNull(response);
        assertEquals(20.0, response.getCompletionPercentage());
        assertEquals(2L, response.getOverdueIssues());
        assertEquals("AT_RISK", response.getHealth().getStatus());
        assertTrue(response.getHealth().getReason().contains("overdue"));
    }

    @Test
    void getProjectAnalytics_unauthorizedUser_shouldThrowForbiddenException() {
        when(projectService.getProjectEntity(100L)).thenReturn(project);
        doThrow(new ForbiddenException("Access denied")).when(projectService).verifyUserAccessToProject(project);

        assertThrows(ForbiddenException.class, () -> projectAnalyticsService.getProjectAnalytics(100L));
    }
}
