package com.devflow.ai.repository;

import com.devflow.ai.model.IssueActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueActivityRepository extends JpaRepository<IssueActivity, Long> {
    List<IssueActivity> findByIssueIdOrderByCreatedAtDesc(Long issueId);
    void deleteByIssueId(Long issueId);
    void deleteByUserId(Long userId);
}
