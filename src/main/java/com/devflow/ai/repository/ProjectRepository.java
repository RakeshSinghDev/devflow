package com.devflow.ai.repository;

import com.devflow.ai.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerId(Long ownerId);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN ProjectMember pm ON p.id = pm.project.id WHERE p.owner.id = :userId OR pm.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);
}