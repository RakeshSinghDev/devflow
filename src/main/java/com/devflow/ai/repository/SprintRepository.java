package com.devflow.ai.repository;

import com.devflow.ai.model.Sprint;
import com.devflow.ai.model.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectId(Long projectId);

    Optional<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);
}
