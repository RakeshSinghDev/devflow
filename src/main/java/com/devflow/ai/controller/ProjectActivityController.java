package com.devflow.ai.controller;

import com.devflow.ai.dto.ProjectActivityDTO;
import com.devflow.ai.service.ProjectActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/activity")
@RequiredArgsConstructor
public class ProjectActivityController {

    private final ProjectActivityService projectActivityService;

    @GetMapping
    public ResponseEntity<List<ProjectActivityDTO>> getActivityByProject(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(projectActivityService.getActivityByProject(projectId));
    }
}
