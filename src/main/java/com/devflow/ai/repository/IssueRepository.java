package com.devflow.ai.repository;

import com.devflow.ai.model.Issue;
import com.devflow.ai.model.enums.IssuePriority;
import com.devflow.ai.model.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByProjectId(Long projectId);

    List<Issue> findBySprintId(Long sprintId);

    List<Issue> findByAssigneeId(Long assigneeId);

    List<Issue> findByProjectIdAndStatus(Long projectId, IssueStatus status);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, IssueStatus status);

    long countByProjectIdAndPriority(Long projectId, IssuePriority priority);

    long countByProjectIdAndAssigneeIsNull(Long projectId);

    long countByProjectIdAndDueDateBeforeAndStatusNot(Long projectId, LocalDate date, IssueStatus status);

    long countByProjectIdAndSprintId(Long projectId, Long sprintId);

    long countByProjectIdAndSprintIdAndStatus(Long projectId, Long sprintId, IssueStatus status);

    long countByProjectIdAndAssigneeId(Long projectId, Long assigneeId);

    long countByProjectIdAndAssigneeIdAndStatus(Long projectId, Long assigneeId, IssueStatus status);

    long countByAssigneeId(Long assigneeId);

    long countByAssigneeIdAndStatus(Long assigneeId, IssueStatus status);

    long countByProjectIdAndCreatedById(Long projectId, Long createdById);

    List<Issue> findByCreatedById(Long createdById);
}
