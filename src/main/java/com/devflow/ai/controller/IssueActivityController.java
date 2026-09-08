package com.devflow.ai.controller;

import com.devflow.ai.dto.IssueActivityDTO;
import com.devflow.ai.service.IssueActivityService;
import com.devflow.ai.service.IssueService;
import com.devflow.ai.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/issues/{issueId}/activity")
@RequiredArgsConstructor
public class IssueActivityController {

    private final IssueActivityService issueActivityService;
    private final IssueService issueService;
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<IssueActivityDTO>> getActivityByIssue(@PathVariable("issueId") Long issueId) {
        var issue = issueService.getIssueEntity(issueId);
        projectService.verifyUserAccessToProject(issue.getProject());
        return ResponseEntity.ok(issueActivityService.getActivityByIssue(issueId));
    }
}
