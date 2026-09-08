package com.devflow.ai.controller;

import com.devflow.ai.dto.SprintDTO;
import com.devflow.ai.dto.SprintRequest;
import com.devflow.ai.service.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @GetMapping("/api/sprints")
    public ResponseEntity<List<SprintDTO>> getAllAccessibleSprints() {
        return ResponseEntity.ok(sprintService.getAllAccessibleSprints());
    }

    @GetMapping("/api/sprints/{id}")
    public ResponseEntity<SprintDTO> getSprintById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sprintService.getSprintById(id));
    }

    @PostMapping("/api/sprints")
    public ResponseEntity<SprintDTO> createSprintDirect(@Valid @RequestBody SprintRequest request) {
        return new ResponseEntity<>(sprintService.createSprint(null, request), HttpStatus.CREATED);
    }

    @GetMapping("/api/projects/{projectId}/sprints")
    public ResponseEntity<List<SprintDTO>> getSprintsByProject(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProject(projectId));
    }

    @PostMapping("/api/projects/{projectId}/sprints")
    public ResponseEntity<SprintDTO> createSprintInProject(@PathVariable("projectId") Long projectId, @Valid @RequestBody SprintRequest request) {
        return new ResponseEntity<>(sprintService.createSprint(projectId, request), HttpStatus.CREATED);
    }

    @PutMapping("/api/sprints/{id}")
    public ResponseEntity<SprintDTO> updateSprint(@PathVariable("id") Long id, @RequestBody SprintRequest request) {
        return ResponseEntity.ok(sprintService.updateSprint(id, request));
    }

    @DeleteMapping("/api/sprints/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable("id") Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }
}
