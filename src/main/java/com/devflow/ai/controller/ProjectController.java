package com.devflow.ai.controller;

import com.devflow.ai.dto.*;
import com.devflow.ai.service.ProjectAnalyticsService;
import com.devflow.ai.service.ProjectMemberService;
import com.devflow.ai.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMemberService projectMemberService;
    private final ProjectAnalyticsService projectAnalyticsService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getMyProjects() {
        return ResponseEntity.ok(projectService.getMyProjects());
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectRequest request) {
        return new ResponseEntity<>(projectService.createProject(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<ProjectAnalyticsResponse> getProjectAnalytics(@PathVariable("id") Long id) {
        return ResponseEntity.ok(projectAnalyticsService.getProjectAnalytics(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable("id") Long id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable("id") Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<ProjectMemberDTO>> getMembers(@PathVariable("id") Long projectId) {
        return ResponseEntity.ok(projectMemberService.getMembers(projectId));
    }

    @GetMapping("/{id}/available-members")
    public ResponseEntity<List<UserDTO>> getAvailableMembers(
            @PathVariable("id") Long projectId,
            @RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(projectMemberService.getAvailableMembers(projectId, query));
    }

    @GetMapping("/{id}/members/{userId}/profile")
    public ResponseEntity<MemberProfileDTO> getMemberProfile(
            @PathVariable("id") Long projectId,
            @PathVariable("userId") Long userId) {
        return ResponseEntity.ok(projectMemberService.getMemberProfile(projectId, userId));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ProjectMemberDTO> addMember(@PathVariable("id") Long projectId, @Valid @RequestBody AddMemberRequest request) {
        return new ResponseEntity<>(projectMemberService.addMember(projectId, request), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable("id") Long projectId, @PathVariable("userId") Long userId) {
        projectMemberService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }
}
