package com.devflow.ai.controller;

import com.devflow.ai.dto.IssueDTO;
import com.devflow.ai.dto.IssueRequest;
import com.devflow.ai.dto.IssueStatusUpdateRequest;
import com.devflow.ai.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @GetMapping("/api/projects/{projectId}/issues")
    public ResponseEntity<List<IssueDTO>> getIssuesByProject(@PathVariable("projectId") Long projectId) {
        return ResponseEntity.ok(issueService.getIssuesByProject(projectId));
    }

    @PostMapping("/api/projects/{projectId}/issues")
    public ResponseEntity<IssueDTO> createIssue(@PathVariable("projectId") Long projectId, @Valid @RequestBody IssueRequest request) {
        return new ResponseEntity<>(issueService.createIssue(projectId, request), HttpStatus.CREATED);
    }

    @GetMapping("/api/sprints/{sprintId}/issues")
    public ResponseEntity<List<IssueDTO>> getIssuesBySprint(@PathVariable("sprintId") Long sprintId) {
        return ResponseEntity.ok(issueService.getIssuesBySprint(sprintId));
    }

    @GetMapping("/api/issues/my-assigned")
    public ResponseEntity<List<IssueDTO>> getMyAssignedIssues() {
        return ResponseEntity.ok(issueService.getMyAssignedIssues());
    }

    @GetMapping("/api/issues/{id}")
    public ResponseEntity<IssueDTO> getIssueById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @PutMapping("/api/issues/{id}")
    public ResponseEntity<IssueDTO> updateIssue(@PathVariable("id") Long id, @RequestBody IssueRequest request) {
        return ResponseEntity.ok(issueService.updateIssue(id, request));
    }

    @PatchMapping("/api/issues/{id}/status")
    public ResponseEntity<IssueDTO> updateIssueStatus(@PathVariable("id") Long id, @Valid @RequestBody IssueStatusUpdateRequest request) {
        return ResponseEntity.ok(issueService.updateIssueStatus(id, request.getStatus()));
    }

    @DeleteMapping("/api/issues/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable("id") Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
