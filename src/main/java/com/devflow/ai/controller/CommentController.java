package com.devflow.ai.controller;

import com.devflow.ai.dto.CommentDTO;
import com.devflow.ai.dto.CommentRequest;
import com.devflow.ai.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/api/issues/{issueId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsByIssue(@PathVariable("issueId") Long issueId) {
        return ResponseEntity.ok(commentService.getCommentsByIssue(issueId));
    }

    @PostMapping("/api/issues/{issueId}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable("issueId") Long issueId, @Valid @RequestBody CommentRequest request) {
        return new ResponseEntity<>(commentService.addComment(issueId, request), HttpStatus.CREATED);
    }

    @PutMapping("/api/comments/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable("id") Long id, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.updateComment(id, request));
    }

    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
