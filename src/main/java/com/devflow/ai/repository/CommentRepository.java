package com.devflow.ai.repository;

import com.devflow.ai.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);

    void deleteByIssueId(Long issueId);

    void deleteByUserId(Long userId);
}
